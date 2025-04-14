import { onRequest } from "firebase-functions/https"

/**
 * Handle Slack Buttons interactions
 * https://api.slack.com/interactivity/handling#acknowledgment_response
 *
 * Only accept POST requests
 */
export const slackHandleInteractions = onRequest(async (req, res) => {
   if (req.method !== "POST") {
      res.status(401).end()
      return
   }

   // We just need to send a 200 response for now
   // Our current buttons only open an url, they don't need a response
   res.status(200).end()
})
