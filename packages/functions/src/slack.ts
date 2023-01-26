import config from "./config"
import * as functions from "firebase-functions"

/**
 * Handle Slack Buttons interactions
 * https://api.slack.com/interactivity/handling#acknowledgment_response
 *
 * Only accept POST requests
 */
export const slackHandleInteractions = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      if (req.method !== "POST") {
         res.status(401).end()
         return
      }

      // We just need to send a 200 response for now
      // Our current buttons only open an url, they don't need a response
      res.status(200).end()
   })

export const dummyHttp = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      res.send("hello!")
   })
