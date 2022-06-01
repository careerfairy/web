const config = {
   // Closest to our Firestore region
   // https://firebase.google.com/docs/functions/locations#selecting-regions_firestore-storage
   region: "europe-west1",

   // https://api.slack.com/apps/A0344EKBJ8Z/incoming-webhooks
   slackWebhooks: {
      livestreamAlerts:
         "https://hooks.slack.com/services/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",
   },
}

if (process.env.NODE_ENV !== "production") {
   // avoid real slack notifications during development/testing
   // all messages are sent to #test-slack-integrations
   config.slackWebhooks.livestreamAlerts =
      "https://hooks.slack.com/services/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"
}

module.exports = config
