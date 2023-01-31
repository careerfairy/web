const config = {
   // Closest to our Firestore region
   // https://firebase.google.com/docs/functions/locations#selecting-regions_firestore-storage
   region: "europe-west1",

   // https://api.slack.com/apps/A0344EKBJ8Z/incoming-webhooks
   slackWebhooks: {
      livestreamAlerts:
         "https://hooks.slack.com/services/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",
      livestreamCreated:
         "https://hooks.slack.com/services/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",
   },
}

if (process.env.NODE_ENV !== "production") {
   // avoid real slack notifications during development/testing
   // all messages are sent to #test-slack-integrations
   const testSlackIntegrationsChannel =
      "https://hooks.slack.com/services/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"

   config.slackWebhooks.livestreamAlerts = testSlackIntegrationsChannel
   config.slackWebhooks.livestreamCreated = testSlackIntegrationsChannel
}

export default config
