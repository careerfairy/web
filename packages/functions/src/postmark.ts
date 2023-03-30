import config from "./config"
import * as functions from "firebase-functions"
import { userRepo } from "./api/repositories"

const KEY = "3562ae82-0d74-4c27-98f6-1b92408c671c"

export const postmarkWebhook = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      /**
       * Validate the request is really coming from Postmark
       */
      if (req.get("X-Special-Key") !== KEY || req.method !== "POST") {
         res.status(401).end()
         return
      }

      functions.logger.info("Postmark Webhook", {
         body: req.body,
      })

      if (
         req.body?.RecordType === "SubscriptionChange" &&
         req.body?.Recipient
      ) {
         await userRepo.updateAdditionalInformation(req.body.Recipient, {
            unsubscribed: Boolean(req.body?.SuppressSending),
         })
      }

      // We just need to send a 200 response for now
      // Our current buttons only open an url, they don't need a response
      res.status(200).end()
   })
