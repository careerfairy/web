import * as functions from "firebase-functions"
import { messaging } from "./api/firestoreAdmin"
import { userRepo } from "./api/repositories"
import config from "./config"

function buildMessageObject(token: string) {
   return {
      token: token,
      notification: {
         title: "Very firsts push notification!",
         body: "Thanks for joining and trying this prototype. Make sure you share all the feedback with us. VAMOS!",
      },
   }
}

async function sendNotificationsInBatches(messages) {
   const batchSize = 500
   for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      await messaging.sendEach(batch)
   }
}

export const sendPushNotificationsToEveryone = functions
   .region(config.region)
   .https.onCall(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (data, context) => {
         const users = await userRepo.getAllUsers()
         functions.logger.info("Fetching all users")
         functions.logger.info(`Fetched ${users.length} users`)

         const messages = users
            .filter((user) => user.messagingTokens)
            .map((user) => user.messagingTokens[0])
            .map((token) => buildMessageObject(token))

         functions.logger.info(`Built ${messages.length} messages`)

         try {
            await sendNotificationsInBatches(messages)
            functions.logger.info(`Sent ${messages.length} notifications`)
         } catch (error) {
            functions.logger.error(`Error sending notifications: ${error}`)
         }
      }
   )
