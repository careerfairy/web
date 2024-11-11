import { firestore } from "./FirebaseInstance"
import { Expo } from "expo-server-sdk"

const expo = new Expo()

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

export const getSavedNotification = async (id: string) => {
   try {
      const notificationRef = firestore.collection("savedNotifications").doc(id)
      const doc = await notificationRef.get()
      if (doc.exists) {
         return { id: doc.id, ...doc.data() }
      } else {
         // Document does not exist
         console.error("No such document!")
         return null
      }
   } catch (error) {
      console.log(error)
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

export async function sendExpoPushNotification(filters: any, message: any) {
   try {
      // Filter out invalid tokens
      let tokens: string[] = []

      if (filters.livestream) {
         tokens = await retrieveTokensFromLivestream(filters.livestream)
      } else {
         const userRef = firestore.collection("userData")
         let query = userRef.where("pushToken", "!=", null)

         if (filters.university?.code && filters.university.code !== "other") {
            query = query.where(
               "university.code",
               "==",
               filters.university.code
            )
         }
         if (
            filters.universityCountryCode &&
            filters.universityCountryCode !== "OTHER"
         ) {
            query = query.where(
               "universityCountryCode",
               "==",
               filters.universityCountryCode
            )
         }
         if (filters.gender) {
            query = query.where("gender", "==", filters.gender)
         }
         if (filters.fieldOfStudy?.id) {
            query = query.where(
               "fieldOfStudy.id",
               "==",
               filters.fieldOfStudy.id
            )
         }
         if (filters.levelOfStudy?.id) {
            query = query.where(
               "levelOfStudy.id",
               "==",
               filters.levelOfStudy.id
            )
         }

         const usersSnapshot = await query.get()

         const users: any = usersSnapshot.docs

         tokens = users
            .map((user) => user?.fcmTokens || [])
            .flat()
            .filter((token) => Expo.isExpoPushToken(token))

         tokens = usersSnapshot.docs.map((doc) => doc.data().pushToken)
      }

      if (tokens.length === 0) {
         console.error("No valid Expo push tokens provided.")
         return
      }

      // Create messages for each valid token
      const messages: any = tokens.map((token) => ({
         to: token,
         sound: "default",
         title: message.title,
         body: message.body,
         data: {
            url: message.url,
         },
      }))

      // Chunk messages in groups of 100 to match Expo's API limits
      const chunks = expo.chunkPushNotifications(messages)

      // Send each chunk through Expo's service
      const ticketChunks = chunks.map(async (chunk) => {
         const tickets = await expo.sendPushNotificationsAsync(chunk)
         console.log("Sent chunk", tickets)
      })

      // Wait for all chunks to be sent
      await Promise.all(ticketChunks)
   } catch (error) {
      console.error("Error sending chunk", error)
   }
}

async function retrieveTokensFromLivestream(
   livestreamId: string
): Promise<string[]> {
   try {
      const livestreamDocRef = firestore
         .collection("livestreams")
         .doc(livestreamId)

      const livestreamDocSnap = await livestreamDocRef.get()
      if (!livestreamDocSnap.exists) {
         return []
      }

      const userLiveStreamDataRef =
         livestreamDocRef.collection("userLivestreamData")

      const userLiveStreamDataSnap = await userLiveStreamDataRef.get()

      const users: any = userLiveStreamDataSnap.docs

      return users
         .map((user) => user?.user?.fcmTokens || [])
         .flat()
         .filter((token) => Expo.isExpoPushToken(token))
   } catch (error) {
      console.error("Error retrieving eligible users:", error)
      return []
   }
}
