import admin from "firebase-admin"
import process from "node:process"
import serviceAccount from "./config/service-account.json"

// Initialize Firebase Admin SDK only if it hasn't been initialized already
if (!admin.apps.length) {
   const service: any = serviceAccount
   admin.initializeApp({
      credential: admin.credential.cert(service),
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
   })
}

const messaging = admin.messaging()

// Helper function to chunk tokens into batches of 500
const chunkArray = (array, size) => {
   const result = []
   for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
   }
   return result
}

export default async function handler(req, res) {
   if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" })
   }

   const { tokens, notification } = req.body

   if (
      !tokens ||
      !Array.isArray(tokens) ||
      tokens.length === 0 ||
      !notification
   ) {
      return res
         .status(400)
         .json({ error: "Tokens array and notification payload are required" })
   }

   try {
      // Split tokens into batches of 500
      const tokenBatches = chunkArray(tokens, 500)
      const sendResults = []

      // Send notifications for each batch
      for (const batch of tokenBatches) {
         const message = {
            tokens: batch, // Up to 500 tokens per request
            notification: {
               title: notification.title,
               body: notification.body,
               data: "www.google.com",
            },
         }

         // Send the multicast message for the batch
         const response = await messaging.sendMulticast(message)
         sendResults.push(response)
      }

      // Aggregate results
      const successCount = sendResults.reduce(
         (acc, res) => acc + res.successCount,
         0
      )
      const failureCount = sendResults.reduce(
         (acc, res) => acc + res.failureCount,
         0
      )

      res.status(200).json({
         success: true,
         totalBatches: tokenBatches.length,
         totalSuccess: successCount,
         totalFailures: failureCount,
         results: sendResults,
      })
   } catch (error) {
      res.status(500).json({ error: error.message })
   }
}
