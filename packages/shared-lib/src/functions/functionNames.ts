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

   // Group Admin functions
   sendNewlyPublishedEventEmail: "sendNewlyPublishedEventEmail",
   startPlan: "startPlan_v4",
   sendReminderToNearEndSparksTrialPlanCreationPeriod:
      "sendReminderToNearEndSparksTrialPlanCreationPeriod_v2",
   endOfSparksTrialEmails: "endOfSparksTrialEmails_v2",
   manualEndOfSparksTrialEmails: "manualEndOfSparksTrialEmails",

   // Auth functions
   createNewUserAccount: "createNewUserAccount_v5",

   // Streaming functions
   // fetchAgoraRtcToken: "fetchAgoraRtcToken_v2",

   // Reminders functions
   onLivestreamStartScheduleNoShowReminder:
      "onLivestreamStartScheduleNoShowReminder",
   sendLivestreamNoShowReminder: "sendLivestreamNoShowReminder",

   // Livestream functions
   sendPhysicalEventRegistrationConfirmationEmail:
      "sendPhysicalEventRegistrationConfirmationEmail",
   getRecommendedEvents: "getRecommendedEvents_v7",
   // Sparks functions
   removeAndSyncUserSparkNotification: "removeAndSyncUserSparkNotification_v4",
   createUserSparksFeedEventNotifications:
      "createUserSparksFeedEventNotifications_v4",
   createSparksFeedEventNotifications: "createSparksFeedEventNotifications",
   getSparksFeed: "getSparksFeed_v11",

   // Location functions
   searchLocations: "searchLocations",
   getLocation: "getLocation",

   // Utility functions
   keepFunctionsWarm: "keepFunctionsWarm",

   // Auth functions
   backfillUserData: "backfillUserData_v2",
} as const
