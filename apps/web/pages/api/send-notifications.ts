import { sendExpoPushNotification } from "../../data/firebase/PushNotificationsService"

export default async function handler(req: any, res: any) {
   if (req.method === "POST") {
      const { filters, notificationTabFilter, message } = req.body
      try {
         await sendExpoPushNotification(filters, notificationTabFilter, message)
         res.status(200).json({
            success: true,
            message: "Notifications sent successfully",
         })
      } catch (error) {
         console.error("Error sending notifications:", error)
         res.status(500).json({
            success: false,
            message: "Failed to send notifications",
         })
      }
   } else {
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${req.method} Not Allowed`)
   }
}
