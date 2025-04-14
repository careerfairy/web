import * as functions from "firebase-functions"
import { onRequest } from "firebase-functions/https"
import { userRepo } from "./api/repositories"

/**
 * This is the key that Postmark uses to authenticate the webhook
 * Randomly created by us, we just need to confirm we receive it in the request
 */
const KEY = "3562ae82-0d74-4c27-98f6-1b92408c671c"

/**
 * This function is called when there is a new event in Postmark that we're subscribed
 *
 * Currently, we only care about the SubscriptionChange event, which is triggered when
 * a user unsubscribes from our emails. We need to update our database to reflect this
 */
export const postmarkWebhook = onRequest(async (req, res) => {
   /**
    * Validate the request is really coming from Postmark
    */
   if (req.get("X-Special-Key") !== KEY || req.method !== "POST") {
      res.status(401).end()
      return
   }

   functions.logger.info("Postmark Webhook Body", {
      body: req.body,
   })

   if (req.body?.RecordType === "SubscriptionChange" && req.body?.Recipient) {
      const field = Boolean(req.body?.SuppressSending)
      await userRepo.updateAdditionalInformation(req.body.Recipient, {
         unsubscribed: field,
      })
      functions.logger.info("User unsubscribed field updated to", field)
   }

   res.status(200).end()
})
