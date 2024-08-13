const REGION = "europe-west1"

const config = {
   // Closest to our Firestore region
   // https://firebase.google.com/docs/functions/locations#selecting-regions_firestore-storage
   region: REGION,

   // https://api.slack.com/apps/A0344EKBJ8Z/incoming-webhooks
   slackWebhooks: {
      livestreamAlerts:
         "https://hooks.slack.com/services/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",
      livestreamCreated:
         "https://hooks.slack.com/services/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",
   },

   // Firebase Hosting Domain
   hostingUrl: "https://cdn.careerfairy.io",

   // Functions Base URL
   functionsBaseUrl: `https://${REGION}-careerfairy-e1fd9.cloudfunctions.net`,
}

if (process.env.NODE_ENV !== "production") {
   // avoid real slack notifications during development/testing
   // all messages are sent to #test-slack-integrations
   const testSlackIntegrationsChannel =
      "https://hooks.slack.com/services/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"

   config.slackWebhooks.livestreamAlerts = testSlackIntegrationsChannel
   config.slackWebhooks.livestreamCreated = testSlackIntegrationsChannel

   // Target the firebase functions emulator when loading the bundles
   // locally, no need to use cache (firebase hosting)
   config.hostingUrl = `http://127.0.0.1:5001/careerfairy-e1fd9/${REGION}/`

   // Update functionsBaseUrl for local development
   config.functionsBaseUrl = `http://127.0.0.1:5001/careerfairy-e1fd9/${REGION}`
}

export default config
