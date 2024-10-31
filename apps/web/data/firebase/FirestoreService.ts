import { firestore } from "./FirebaseInstance"
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

   // Firebase FCM only allows max 500 tokens per request
   const response = await fetch("/api/send-multicast", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({
         tokens: tokens, // Split tokens by comma and trim whitespace
         notification: {
            title: message.title,
            body: message.body,
         },
      }),
   })

   const result = await response.json()
   console.log(result)
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
