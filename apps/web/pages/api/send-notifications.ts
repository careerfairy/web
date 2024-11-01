import { sendExpoPushNotification } from "../../data/firebase/FirestoreService"

export default async function handler(req: any, res: any) {
   if (req.method === "POST") {
      const { filters, message } = req.body

      try {
         await sendExpoPushNotification(filters, message)
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
