/**
 * Centralized cloud function names to be shared between client and server
 */

export const FUNCTION_NAMES = {
   // Example functions
   exampleHttp: "exampleHttpFunction_v1",

   // CustomerIO functions
   customerIORecommendedLivestreamsWebhook:
      "customerIORecommendedLivestreamsWebhook",
   customerIORecommendedSparksWebhook: "customerIORecommendedSparksWebhook",

   // Auth functions
   // createNewUserAccount: "createNewUserAccount_v4",

   // Streaming functions
   // fetchAgoraRtcToken: "fetchAgoraRtcToken_v2",

   // Reminders functions
   onLivestreamStartScheduleNoShowReminder:
      "onLivestreamStartScheduleNoShowReminder",
   sendLivestreamNoShowReminder: "sendLivestreamNoShowReminder",

   // Utility functions
   keepFunctionsWarm: "keepFunctionsWarm",
} as const
