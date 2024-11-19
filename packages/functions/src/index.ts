import * as ModuleAlias from "module-alias"
/**
 * Fix runtime import of local packages
 * Required to avoid importing from the /dist folder
 *
 * https://stackoverflow.com/a/56584739
 * https://github.com/firebase/firebase-tools/issues/986
 */
ModuleAlias.addAliases({
   "@careerfairy/shared-lib": __dirname + "../../../shared-lib/src",
})

import dotenv = require("dotenv")

// load values from the .env file in this directory into process.env
dotenv.config()

// to prevent import issue
import { setGlobalOptions } from "firebase-functions/v2"
import config from "./config"

/**
 * Set the default region for all functions using the v2 SDK.
 * This configuration needs to be set before importing any functions.
 *
 * @remarks
 * The region setting affects where the Cloud Functions will be deployed and executed.
 * Setting it globally ensures consistency across all functions defined in this file.
 */
setGlobalOptions({
   region: config.region,
})

import { bundles } from "./bundles"
import { fetchUserCountryCode } from "./fetchUserCountryCode"
import { generateFunctionsFromBundles } from "./lib/bundleGenerator"
import { generateFunctionsFromIndexes } from "./lib/search/searchIndexGenerator"
import { knownIndexes } from "./lib/search/searchIndexes"
import * as streaming from "./lib/streaming"

// Imported Individual Cloud functions
import auth = require("./auth")
import agora = require("./agora")
import backup = require("./backup")
import groupAdmin = require("./groupAdmin")
import admin = require("./admin")
import reminders = require("./reminders")
import livestreams = require("./livestreams")
import analytics = require("./analytics")
import breakoutRooms = require("./breakoutRooms")
import recording = require("./recording")
import slack = require("./slack")
import rewards = require("./rewards")
import wishes = require("./wishes")
import cms = require("./cms")
import marketing = require("./marketing")
import atsUser = require("./atsUser")
import atsGroup = require("./atsGroup")
import bigQuery = require("./bigQuery")
import groupAnalytics = require("./groupAnalytics")
import cacheClear = require("./cacheClear")
import recommendation = require("./recommendation")
import onWriteTriggers = require("./onWriteTriggers")
import onCreateTriggers = require("./onCreateTriggers")
import onDeleteTriggers = require("./onDeleteTriggers")
import newsletter = require("./newsletter")
import postmark = require("./postmark")
import groupSparks = require("./groupSparks")
import userSparks = require("./userSparks")
import sparksAnalytics = require("./sparksAnalytics")
import customJobs = require("./customJobs")
import notificationSparks = require("./notificationSparks")
import groupPlans = require("./groupPlans")
import search = require("./search")
import companies = require("./companies")
import onboardingNewsletter = require("./onboardingNewsletter")
import endOfSparksTrials = require("./sparksTrials")
import stripe = require("./stripe")
import tags = require("./lib/tagging/tags")
import notificationLivestreams = require("./notificationLivestreams")
import notificationOnboardings = require("./notificationOnboarding")
import user = require("./user")

// Auth
exports.createNewUserAccount_v2 = auth.createNewUserAccount
exports.createNewGroupAdminUserAccount_eu = auth.createNewGroupAdminUserAccount
exports.backfillUserData_eu = auth.backfillUserData
exports.validateUserEmailWithPin_eu = auth.validateUserEmailWithPin
exports.sendPostmarkResetPasswordEmail_eu = auth.sendPostmarkResetPasswordEmail
exports.resendPostmarkEmailVerificationEmailWithPin_eu =
   auth.resendPostmarkEmailVerificationEmailWithPin
exports.deleteLoggedInUserAccount_eu = auth.deleteLoggedInUserAccount

// Agora
exports.fetchAgoraRtcToken_v2 = agora.fetchAgoraRtcToken
exports.fetchAgoraRtmToken_v2 = agora.fetchAgoraRtmToken

// Backup
exports.exportFirestoreBackup_eu = backup.exportFirestoreBackup

// Admin Functions
exports.sendBasicTemplateEmail_v3 = admin.sendBasicTemplateEmail
exports.unsubscribeFromMarketingEmails_eu = admin.unsubscribeFromMarketingEmails

// Group Admin
exports.sendDraftApprovalRequestEmail_eu =
   groupAdmin.sendDraftApprovalRequestEmail
exports.sendNewlyPublishedEventEmail_v2 =
   groupAdmin.sendNewlyPublishedEventEmail
exports.getLivestreamReportData_v2 = groupAdmin.getLivestreamReportData
exports.sendDashboardInviteEmail_eu = groupAdmin.sendDashboardInviteEmail
exports.joinGroupDashboard_eu = groupAdmin.joinGroupDashboard
exports.createGroup_eu = groupAdmin.createGroup
exports.changeRole_eu = groupAdmin.changeRole
exports.kickFromDashboard_eu = groupAdmin.kickFromDashboard

// Reminders
exports.sendReminderEmailToRegistrants =
   reminders.sendReminderEmailToRegistrants
exports.sendReminderEmailAboutApplicationLink_eu =
   reminders.sendReminderEmailAboutApplicationLink
exports.scheduleReminderEmails_eu = reminders.scheduleReminderEmails
exports.sendReminderToNonAttendees = reminders.sendReminderToNonAttendees
exports.sendReminderForNonAttendeesByStreamId =
   reminders.sendReminderForNonAttendeesByStreamId

exports.newsletter = newsletter.newsletter
exports.manualNewsletter = newsletter.manualNewsletter
exports.onboardingNewsletter = onboardingNewsletter.onboardingNewsletter
exports.manualOnboardingNewsletter =
   onboardingNewsletter.manualOnboardingNewsletter
exports.manualEndOfSparksTrialEmails =
   endOfSparksTrials.manualEndOfSparksTrialEmails
exports.endOfSparksTrialEmails = endOfSparksTrials.endOfSparksTrialEmails
exports.manualTemplatedEmail = newsletter.manualTemplatedEmail

// Notification Livestreams
exports.notifyUsersWhenLivestreamStarts =
   notificationLivestreams.notifyUsersWhenLivestreamStarts

// Notification Onboarding
exports.notificationOnboarding = notificationOnboardings.notificationOnboarding

// User
exports.updateUserLiveStreamDataOnUserChange =
   user.updateUserLiveStreamDataOnUserChange

// Stripe
exports.stripeWebHook = stripe.stripeWebHook
exports.fetchStripeCustomerSession = stripe.fetchStripeCustomerSession
exports.fetchStripePrice = stripe.fetchStripePrice
exports.fetchStripeSessionStatus = stripe.fetchStripeSessionStatus

// Livestreams
exports.sendLivestreamRegistrationConfirmationEmail_v3 =
   livestreams.sendLivestreamRegistrationConfirmationEmail
exports.sendLivestreamRegistrationConfirmationEmail_v4 =
   livestreams.livestreamRegistrationConfirmationEmail
exports.sendPhysicalEventRegistrationConfirmationEmail_eu =
   livestreams.sendPhysicalEventRegistrationConfirmationEmail
exports.sendHybridEventRegistrationConfirmationEmail_eu =
   livestreams.sendHybridEventRegistrationConfirmationEmail
exports.notifySlackWhenALivestreamStarts =
   livestreams.notifySlackWhenALivestreamStarts
exports.notifySlackWhenALivestreamIsCreated =
   livestreams.notifySlackWhenALivestreamIsCreated
exports.getLivestreamICalendarEvent_v3 = livestreams.getLivestreamICalendarEvent

exports.upsertLivestreamSpeaker = streaming.upsertLivestreamSpeaker

// Tags
exports.fetchTagsContentHits = tags.fetchContentHits

// Postmark webhooks
exports.postmarkWebhook = postmark.postmarkWebhook

// Deploy each bundle as a separate function
// npx firelink deploy --only functions:bundle-allFutureLivestreams
//
// When adding new bundles, you probably also want to update the
// Firebase Hosting mappings: npx firebase deploy --only hosting
exports.bundle = generateFunctionsFromBundles(bundles)

// Analytics
exports.updateUserDataAnalytcicsOnWrite_eu =
   analytics.updateUserDataAnalyticsOnWrite

// Recording
exports.startRecordingLivestream_eu = recording.startRecordingLivestream
exports.stopRecordingLivestream_eu = recording.stopRecordingLivestream
exports.automaticallyRecordLivestream = recording.automaticallyRecordLivestream
exports.automaticallyRecordLivestreamBreakoutRoom =
   recording.automaticallyRecordLivestreamBreakoutRoom
exports.checkForUnfinishedLivestreamsAndStopRecording =
   recording.checkForUnfinishedLivestreamsAndStopRecording

// Breakout Rooms
exports.updateBreakoutRoomStatusOnWrite_eu =
   breakoutRooms.updateBreakoutRoomStatusOnWrite

// Slack Interaction Handler
exports.slackHandleInteractions = slack.slackHandleInteractions

// Rewards
exports.rewardLivestreamInvitationComplete_eu =
   rewards.rewardLivestreamInvitationComplete
exports.rewardUserAction_v2 = rewards.rewardUserAction
exports.applyReferralCode_eu = rewards.applyReferralCode

// Ratings
exports.onUserRateWish = wishes.onUserRateWish

// CMS
exports.syncFieldsOfStudyToHygraph = cms.syncFieldsOfStudyToHygraph

// Marketing
exports.createMarketingUser_eu = marketing.createMarketingUser

// ATS
// Group
exports.mergeGenerateLinkToken_eu = atsGroup.mergeGenerateLinkToken
exports.mergeGetAccountToken_eu = atsGroup.mergeGetAccountToken
exports.mergeMetaEndpoint_eu = atsGroup.mergeMetaEndpoint
exports.mergeRemoveAccount_eu = atsGroup.mergeRemoveAccount
exports.fetchATSJobs_eu = atsGroup.fetchATSJobs
exports.fetchATSRecruiters_eu = atsGroup.fetchATSRecruiters
exports.fetchATSSyncStatus_eu = atsGroup.fetchATSSyncStatus
exports.candidateApplicationTest_eu = atsGroup.candidateApplicationTest

// User
exports.atsUserApplyToJob_eu = atsUser.atsUserApplyToJob
exports.fetchLivestreamJobs_eu = atsUser.fetchLivestreamJobs
exports.updateUserJobApplications_eu = atsUser.updateUserJobApplications

// BigQuery
exports.getBigQueryUsers_v2 = bigQuery.getBigQueryUsers

// Group Analytics
exports.getRegistrationSources_eu = groupAnalytics.getRegistrationSources

// Clear cached documents
exports.periodicallyRemoveCachedDocument =
   cacheClear.periodicallyRemoveCachedDocument

// Crisp
// exports.getCrispSignature = crisp.getCrispSignature

// Recommendations
exports.getRecommendedEvents_v4 = recommendation.getRecommendedEvents

// On Write Triggers for all collections
exports.syncLivestreams = onWriteTriggers.syncLivestreams
exports.syncLivestreamStartNotifications =
   onWriteTriggers.syncLivestreamStartNotifications
exports.syncUserLivestreamData = onWriteTriggers.syncUserLivestreamData
exports.syncLivestreamStats = onWriteTriggers.syncLivestreamStats
exports.syncUserStats = onWriteTriggers.syncUserStats
exports.onWriteCreator = onWriteTriggers.onWriteCreator
exports.onWriteGroup = onWriteTriggers.onWriteGroup
exports.onWriteSpark = onWriteTriggers.onWriteSpark
exports.onWriteCustomJobs = onWriteTriggers.onWriteCustomJobs
exports.onWriteCustomJobsSendNotifications =
   onWriteTriggers.onWriteCustomJobsSendNotifications

// On Create Triggers for all collections
exports.onCreateLivestreamPopularityEvents =
   onCreateTriggers.onCreateLivestreamPopularityEvents
exports.onCreateLivestreamRatingAnswer =
   onCreateTriggers.onCreateLivestreamRatingAnswer
exports.onCreateUserData = onCreateTriggers.onCreateUserData
exports.onUpdateUserData = onCreateTriggers.onUpdateUserData
exports.onCreateReward = onCreateTriggers.onCreateReward
exports.onCreateUserLivestreamData = onCreateTriggers.onCreateUserLivestreamData
exports.onCreateUserSparkFeed = onCreateTriggers.onCreateUserSparkFeed
exports.onCreateSparkStats = onCreateTriggers.onCreateSparkStats

// On Delete Triggers for all collections
exports.onDeleteLivestreamPopularityEvents =
   onDeleteTriggers.onDeleteLivestreamPopularityEvents
exports.onDeleteUserSparkFeed = onDeleteTriggers.onDeleteUserSparkFeed
exports.onDeleteDraft = onDeleteTriggers.onDeleteDraft

// Group Spark Functions
exports.createSpark_v5 = groupSparks.createSpark
exports.updateSpark_v4 = groupSparks.updateSpark
exports.deleteSpark_v3 = groupSparks.deleteSpark

// User Spark Notification Functions
exports.createSparksFeedEventNotifications =
   notificationSparks.createSparksFeedEventNotifications
exports.createUserSparksFeedEventNotifications_v2 =
   notificationSparks.createUserSparksFeedEventNotifications
exports.removeAndSyncUserSparkNotification_v2 =
   notificationSparks.removeAndSyncUserSparkNotification

// User Spark Functions
exports.getSparksFeed_v8 = userSparks.getSparksFeed
exports.markSparkAsSeenByUser_v4 = userSparks.markSparkAsSeenByUser

// Spark Analytics Functions
exports.trackSparkEvents_v6 = userSparks.trackSparkEvents
exports.trackSparkSecondsWatched_v4 = userSparks.trackSparkSecondsWatched
exports.getSparksAnalytics_v6 = sparksAnalytics.getSparksAnalytics
exports.getSparkStats_v1 = sparksAnalytics.getSparkStats

// Custom Jobs
exports.confirmUserJobApplication = customJobs.confirmUserApplyToCustomJob
exports.confirmAnonymousJobApplication = customJobs.confirmAnonApplyToCustomJob
exports.setAnonymousJobApplicationsUserId =
   customJobs.setAnonymousJobApplicationsUserId
exports.updateCustomJobWithLinkedLivestreams_v2 =
   customJobs.updateCustomJobWithLinkedLivestreams
exports.transferCustomJobsFromDraftToPublishedLivestream_v2 =
   customJobs.transferCustomJobsFromDraftToPublishedLivestream
exports.syncPermanentlyExpiredCustomJobs =
   customJobs.syncPermanentlyExpiredCustomJobs
exports.fetchCustomJobGroupNames = customJobs.getCustomJobGroupNames
exports.setRemoveUserJobApplication = customJobs.setRemoveUserJobApplication

// Group Subscription Plan Functions
exports.startPlan_v3 = groupPlans.startPlan
exports.sendReminderToNearEndSparksTrialPlanCreationPeriod =
   groupPlans.sendReminderToNearEndSparksTrialPlanCreationPeriod
exports.checkExpiredPlans = groupPlans.checkExpiredPlans
exports.manualCheckExpiredPlans = groupPlans.manualCheckExpiredPlans
// Search
exports.fullIndexSync = search.fullIndexSync

// Deploy each index as a separate function
// npx firelink deploy --only functions:searchIndex-livestreams
//
exports.searchIndex = generateFunctionsFromIndexes(knownIndexes)

// Company | Group Functions
exports.fetchCompanies = companies.fetchCompanies

// Streaming
exports.deleteLivestreamChatEntry = streaming.deleteLivestreamChatEntry
exports.createPoll = streaming.createPoll
exports.deletePoll = streaming.deletePoll
exports.updatePoll = streaming.updatePoll
exports.markPollAsCurrent = streaming.markPollAsCurrent
exports.resetQuestion = streaming.resetQuestion
exports.markQuestionAsCurrent = streaming.markQuestionAsCurrent
exports.markQuestionAsDone = streaming.markQuestionAsDone
exports.toggleHandRaise = streaming.toggleHandRaise
exports.upsertLivestreamSpeaker = streaming.upsertLivestreamSpeaker
exports.createCTA = streaming.createCTA
exports.deleteCTA = streaming.deleteCTA
exports.updateCTA = streaming.updateCTA
exports.toggleActiveCTA = streaming.toggleActiveCTA
exports.onUserRegistration = streaming.onUserRegistration
exports.syncUserInRegisteredLivestreams =
   streaming.syncUserInRegisteredLivestreams

// Utils
exports.fetchUserCountryCode = fetchUserCountryCode
