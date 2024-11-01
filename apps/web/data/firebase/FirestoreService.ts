import { firestore } from "./FirebaseInstance"
import process from "node:process"
import axios from "axios"

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
   const result = []
   for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize))
   }
   return result
}

export const sendNotificationToFilteredUsers = async (
   filters: any,
   message: any
) => {
   const userRef = firestore.collection("userData")
   const query = userRef.where("pushToken", "!=", null)

   // Apply each filter to the query
   // Object.keys(filters).forEach((field) => {
   //     const value = filters[field];
   //     query = query.where(field, '==', value);
   // });

   const usersSnapshot = await query.get()
   const tokens: string[] = usersSnapshot.docs.map(
      (doc) => doc.data().pushToken
   )
   console.log(tokens)

   const tokenChunks = chunkArray(tokens, 500)

   // Create an array of promises to send each batch
   const sendPromises = tokenChunks.map((chunk) =>
      sendMulticastNotification(
         chunk,
         message.title,
         message.body,
         "https://www.google.com"
      )
   )

   // Send all batches concurrently and wait for all to finish
   try {
      const results = await Promise.all(sendPromises)
      console.log("All notifications sent successfully:", results)
   } catch (error) {
      console.error("Error sending some notifications:", error)
   }
}

export const createSavedNotification = async (data: any) => {
   try {
      const ref = await firestore.collection("savedNotifications").add({
         ...data,
         createdAt: new Date(),
      })
      return ref.id
   } catch (error) {
      console.error("Error creating notification:", error)
   }
}

export const getSavedNotifications = async (
   pageSize = 10,
   lastVisible = null
) => {
   try {
      let query = firestore
         .collection("savedNotifications")
         .limit(pageSize)
         .orderBy("createdAt", "desc")
      if (lastVisible) query = query.startAfter(lastVisible)
      const snapshot = await query.get()
      const notifications = snapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
      }))
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1]
      return { notifications, lastVisible: newLastVisible }
   } catch (error) {
      console.error("Error getting notifications:", error)
   }
}

export const updateSavedNotification = async (id: string, data: any) => {
   try {
      await firestore.collection("savedNotifications").doc(id).update(data)
   } catch (error) {
      console.error("Error updating notification:", error)
   }
}

export const deleteSavedNotification = async (id: string) => {
   try {
      await firestore.collection("savedNotifications").doc(id).delete()
   } catch (error) {
      console.error("Error deleting notification:", error)
   }
}

async function sendMulticastNotification(
   tokens: string[],
   title: string,
   body: string,
   url?: string
) {
   const serverKey = process.env.FCM_KEY

   // Construct the notification payload
   const payload = {
      notification: {
         title: title,
         body: body,
         click_action: url,
      },
      registration_ids: tokens,
   }

   try {
      const response = await axios.post(
         "https://fcm.googleapis.com/fcm/send",
         payload,
         {
            headers: {
               "Content-Type": "application/json",
               Authorization: `key=${serverKey}`,
            },
         }
      )
      console.log("Notification sent successfully:", response.data)
   } catch (error) {
      console.error(
         "Error sending notification:",
         error.response?.data || error.message
      )
   }
}
