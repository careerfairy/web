const REGION = "europe-west1"
const PROJECT_ID = "careerfairy-e1fd9"

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
      sparksTrialStarted:
         "https://hooks.slack.com/services/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",
      offlineEventPublished:
         "https://hooks.slack.com/services/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",
      offlineEventPurchased:
         "https://hooks.slack.com/services/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",
      offlineEventIncreaseFailed:
         "https://hooks.slack.com/services/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",
      transcriptionPermanentlyFailed:
         "https://hooks.slack.com/services/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", // TODO: Add Slack webhook URL
      chapterizationPermanentlyFailed:
         "https://hooks.slack.com/services/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", // TODO: Add Slack webhook URL
   },

   // Firebase Hosting Domain
   hostingUrl: "https://cdn.careerfairy.io",

   functionsBaseUrl: `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`,
}

if (process.env.NODE_ENV !== "production") {
   // avoid real slack notifications during development/testing
   // all messages are sent to #test-slack-integrations
   const testSlackIntegrationsChannel =
      "https://hooks.slack.com/services/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"

   config.slackWebhooks.livestreamAlerts = testSlackIntegrationsChannel
   config.slackWebhooks.livestreamCreated = testSlackIntegrationsChannel
   config.slackWebhooks.sparksTrialStarted = testSlackIntegrationsChannel
   config.slackWebhooks.offlineEventPublished = testSlackIntegrationsChannel
   config.slackWebhooks.offlineEventPurchased = testSlackIntegrationsChannel
   config.slackWebhooks.offlineEventIncreaseFailed =
      testSlackIntegrationsChannel
   config.slackWebhooks.transcriptionPermanentlyFailed =
      testSlackIntegrationsChannel
   config.slackWebhooks.chapterizationPermanentlyFailed =
      testSlackIntegrationsChannel

   // Target the firebase functions emulator when loading the bundles
   // locally, no need to use cache (firebase hosting)
   config.hostingUrl = `http://127.0.0.1:5001/careerfairy-e1fd9/${config.region}/`
   config.functionsBaseUrl = `http://127.0.0.1:5001/${PROJECT_ID}/${REGION}`
}

export default config
