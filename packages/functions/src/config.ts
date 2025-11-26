const REGION = "europe-west1"
const PROJECT_ID = "careerfairy-e1fd9"

const config = {
   // Closest to our Firestore region
   // https://firebase.google.com/docs/functions/locations#selecting-regions_firestore-storage
   region: REGION,

   // https://api.slack.com/apps/A0344EKBJ8Z/incoming-webhooks
   slackWebhooks: {
      livestreamAlerts: process.env.SLACK_WEBHOOK_LIVESTREAM_ALERTS || "",
      livestreamCreated: process.env.SLACK_WEBHOOK_LIVESTREAM_CREATED || "",
      sparksTrialStarted: process.env.SLACK_WEBHOOK_SPARKS_TRIAL_STARTED || "",
      offlineEventPublished:
         process.env.SLACK_WEBHOOK_OFFLINE_EVENT_PUBLISHED || "",
      offlineEventPurchased:
         process.env.SLACK_WEBHOOK_OFFLINE_EVENT_PURCHASED || "",
      offlineEventIncreaseFailed:
         process.env.SLACK_WEBHOOK_OFFLINE_EVENT_INCREASE_FAILED || "",
      transcriptionPermanentlyFailed:
         process.env.SLACK_WEBHOOK_TRANSCRIPTION_PERMANENTLY_FAILED || "",
      chapterizationPermanentlyFailed:
         process.env.SLACK_WEBHOOK_CHAPTERIZATION_PERMANENTLY_FAILED || "",
   },

   // Firebase Hosting Domain
   hostingUrl: "https://cdn.careerfairy.io",

   functionsBaseUrl: `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`,
}

if (process.env.NODE_ENV !== "production") {
   // avoid real slack notifications during development/testing
   // all messages are sent to #test-slack-integrations
   const testSlackIntegrationsChannel =
      process.env.SLACK_WEBHOOK_TEST_CHANNEL || ""

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
