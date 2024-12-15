import { firestore } from "./FirebaseInstance"
import { Expo } from "expo-server-sdk"

const expo = new Expo()

export type NotificationData = {
   title: string
   body: string
   url: string
   tabValue: number
   filters: Filter
}

export type NotificationResponse = NotificationData & Identification

type Identification = {
   id: string
}

type Filter = any

export type MessageBody = {
   title: string
   body: string
   url: string
}

export const createSavedNotification = async (data: NotificationData) => {
   try {
      const ref = await firestore.collection("pushNotifications").add({
         ...data,
         createdAt: new Date(),
      })
      return ref.id
   } catch (error) {
      console.error("Error creating notification:", error)
   }
}

export const getSavedNotification = async (
   id: string
): Promise<NotificationResponse> => {
   try {
      const notificationRef = firestore.collection("pushNotifications").doc(id)
      const doc = await notificationRef.get()
      if (doc.exists) {
         return { id: doc.id, ...(doc.data() as NotificationData) }
      } else {
         // Document does not exist
         console.error("No such document!")
         return null
      }
   } catch (error) {
      console.log(error)
   }
}

export const updateSavedNotification = async (
   id: string,
   data: NotificationData
) => {
   try {
      await firestore.collection("pushNotifications").doc(id).update(data)
   } catch (error) {
      console.error("Error updating notification:", error)
   }
}

export const deleteSavedNotification = async (id: string) => {
   try {
      await firestore.collection("pushNotifications").doc(id).delete()
   } catch (error) {
      console.error("Error deleting notification:", error)
   }
}

export async function sendExpoPushNotification(
   filters: Filter,
   activeTabFilter: number,
   message: MessageBody
) {
   try {
      // Filter out invalid tokens
      let tokens: string[] = []
      if (activeTabFilter === 0) {
         tokens = await retrieveTokensFromLivestream(filters.livestream)
      } else if (activeTabFilter === 1) {
         const userRef = firestore.collection("userData")
         let query = userRef.where("fcmTokens", "!=", null)

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
         if (
            filters.gender &&
            (filters.gender === "male" ||
               filters.gender === "female" ||
               filters.gender === "other")
         ) {
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

         const users: any = usersSnapshot.docs.map((user) => user.data())

         tokens = users
            .map((user) => user?.fcmTokens || [])
            .flat()
            .filter((token) => Expo.isExpoPushToken(token))
      } else {
         tokens = await retrieveTokensFromEmails(filters.emails)
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

      const fcmTokensArray = []

      userLiveStreamDataSnap.forEach((doc) => {
         const userData = doc.data().user
         if (userData && userData.fcmTokens) {
            fcmTokensArray.push(...userData.fcmTokens) // Spread the tokens array into fcmTokensArray
         }
      })

      return fcmTokensArray.filter((token) => Expo.isExpoPushToken(token))
   } catch (error) {
      console.error("Error retrieving eligible users:", error)
      return []
   }
}

async function retrieveTokensFromEmails(emails: string[]): Promise<string[]> {
   try {
      const userDocs = await Promise.all(
         emails.map(async (email) => {
            const userDocRef = firestore.collection("userData").doc(email)

            const userDoc = await userDocRef.get()
            if (userDoc.exists) {
               return { id: email, ...userDoc.data() } // Include the email (document ID) in the result
            } else {
               return null // Handle cases where the document doesn't exist
            }
         })
      )

      return userDocs
         .map((user: any) => user?.fcmTokens || [])
         .flat()
         .filter((token) => Expo.isExpoPushToken(token))
   } catch (error) {
      console.error("Error retrieving eligible users:", error)
      return []
   }
}
