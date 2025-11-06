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
   customerIORecommendedJobsWebhook: "customerIORecommendedJobsWebhook",

   // Group Admin functions
   sendNewlyPublishedEventEmail: "sendNewlyPublishedEventEmail",
   startPlan: "startPlan_v5",
   sendReminderToNearEndSparksTrialPlanCreationPeriod:
      "sendReminderToNearEndSparksTrialPlanCreationPeriod_v2",
   endOfSparksTrialEmails: "endOfSparksTrialEmails_v2",
   manualEndOfSparksTrialEmails: "manualEndOfSparksTrialEmails",

   // Group Spark functions
   createSpark: "createSpark_v6",
   updateSpark: "updateSpark_v5",
   deleteSpark: "deleteSpark_v4",

   // Auth functions
   createNewUserAccount: "createNewUserAccount_v5",

   // Streaming functions
   upsertLivestreamSpeaker: "upsertLivestreamSpeaker_v4",
   deleteLivestream: "deleteLivestream",
   updateCreatorRoles: "updateCreatorRoles",
   getLivestreamsICalendarEvents: "getLivestreamsICalendarEvents_v2",

   // Reminders functions
   onLivestreamStartScheduleNoShowReminder:
      "onLivestreamStartScheduleNoShowReminder",
   sendLivestreamNoShowReminder: "sendLivestreamNoShowReminder_v3",

   // Livestream functions
   sendLivestreamRegistrationConfirmationEmail:
      "sendLivestreamRegistrationConfirmationEmail_v8",
   sendPhysicalEventRegistrationConfirmationEmail:
      "sendPhysicalEventRegistrationConfirmationEmail_v2",
   getRecommendedEvents: "getRecommendedEvents_v7",
   getRecommendedJobs: "getRecommendedJobs_v2",

   // Recording functions
   getRecordingViews: "getRecordingViews",
   automaticallyRecordLivestream: "automaticallyRecordLivestream_v2",
   automaticallyRecordLivestreamBreakoutRoom:
      "automaticallyRecordLivestreamBreakoutRoom_v2",
   stopRecordingLivestream_eu: "stopRecordingLivestream_eu_v2",

   // Sparks functions
   removeAndSyncUserSparkNotification: "removeAndSyncUserSparkNotification_v4",
   createUserSparksFeedEventNotifications:
      "createUserSparksFeedEventNotifications_v4",
   createSparksFeedEventNotifications: "createSparksFeedEventNotifications",
   getSparksFeed: "getSparksFeed_v12",

   // Location functions
   searchLocations: "searchLocations_v3",
   getLocation: "getLocation_v2",

   // Utility functions
   keepFunctionsWarm: "keepFunctionsWarm",
   keepOnCallFunctionsWarm: "keepOnCallFunctionsWarm_v2",

   // Auth functions
   backfillUserData: "backfillUserData_v2",

   // Group talent engagement functions
   getGroupTalentEngagement: "getGroupTalentEngagement",
   getTotalUsersMatchingTargeting: "getTotalUsersMatchingTargeting",

   // Offline events functions
   trackOfflineEventAction: "trackOfflineEventAction",

   // Slack Notifications
   notifySlackWhenSparksTrialStarts: "notifySlackWhenSparksTrialStarts",
   notifySlackWhenOfflineEventIsPublished:
      "notifySlackWhenOfflineEventIsPublished",

   // -- Trigger functions -- //
   /**
    * Note:
    * New trigger function required for Cloud Functions Gen 2 upgrade.
    * Gen 1 triggers can't be upgraded in place, so deploy with a new name.
    * As soon as deployment is complete, delete the old trigger function.
    */
   syncLivestreams: "syncLivestreams_v2",
   syncUserLivestreamData: "syncUserLivestreamData_v2",
   onCreateLivestreamRatingAnswer: "onCreateLivestreamRatingAnswer_v2",
   syncLivestreamStats: "syncLivestreamStats_v2",
   checkExpiredPlans: "checkExpiredPlans_v2",

   // Stripe functions
   stripeWebHook: "stripeWebHook_v3",
   fetchStripeCustomerSession: "fetchStripeCustomerSession_v3",
   fetchStripePrice: "fetchStripePrice_v3",
   fetchStripeSessionStatus: "fetchStripeSessionStatus_v3",

   // Transcription functions
   initiateTranscriptionOnRecordingAvailable:
      "initiateTranscriptionOnRecordingAvailable",
   manualLivestreamTranscription: "manualLivestreamTranscription",
} as const

/**
 * Bundle function names
 * These are HTTP endpoints that return Firebase bundles with cached queries
 */
export const BUNDLE_NAMES = {
   allFutureLivestreams: "allFutureLivestreams",
   futureLivestreamsNext15Days: "futureLivestreamsNext15Days",
   pastYearLivestreams: "pastYearLivestreams",
   allSparksStats: "allSparksStats",
   allFutureOfflineEvents: "allFutureOfflineEvents",
} as const

export type BundleName = (typeof BUNDLE_NAMES)[keyof typeof BUNDLE_NAMES]
