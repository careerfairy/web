module.exports = {
   // Closest to our Firestore region
   // https://firebase.google.com/docs/functions/locations#selecting-regions_firestore-storage
   region: "europe-west1",

   // https://api.slack.com/apps/A0344EKBJ8Z/incoming-webhooks
   slackWebhooks: {
      livestreamAlerts:
         "https://hooks.slack.com/services/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",
   },
}
