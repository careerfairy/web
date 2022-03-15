const functions = require("firebase-functions");
const config = require("./config");

/**
 * Handle Slack Buttons interactions
 * https://api.slack.com/interactivity/handling#acknowledgment_response
 *
 * Only accept POST requests
 */
exports.slackHandleInteractions = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      if (req.method !== "POST") {
         return res.status(401).end();
      }

      // We just need to send a 200 response for now
      // Our current buttons only open an url, they don't need a response
      res.status(200).end();
   });
