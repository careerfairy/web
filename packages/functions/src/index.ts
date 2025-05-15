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

import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions"
import { bundles } from "./bundles"
import { fetchUserCountryCode } from "./fetchUserCountryCode"
import { generateFunctionsFromBundles } from "./lib/bundleGenerator"
import * as customerio from "./lib/customerio"
import { generateFunctionsFromIndexes } from "./lib/search/searchIndexGenerator"
import { knownIndexes } from "./lib/search/searchIndexes"
import * as streaming from "./lib/streaming"
import * as warming from "./lib/warming"

// Imported Individual Cloud functions
import auth = require("./auth")
import agora = require("./agora")
import backup = require("./backup")
import groupAdmin = require("./groupAdmin")
import admin = require("./admin")
import reminders = require("./reminders")
import remindersNoShow = require("./reminders-no-show")
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
import countries = require("./countries")
import levels = require("./levels")
import remindersNew = require("./reminders-new")
import followups = require("./followups")
// Auth
exports[FUNCTION_NAMES.createNewUserAccount] = auth.createNewUserAccount
exports.createNewGroupAdminUserAccount = auth.createNewGroupAdminUserAccount
exports[FUNCTION_NAMES.backfillUserData] = auth.backfillUserData
exports.validateUserEmailWithPin_v2 = auth.validateUserEmailWithPin
exports.sendPasswordResetEmail = auth.sendPasswordResetEmail
exports.resendEmailVerificationEmailWithPin =
   auth.resendEmailVerificationEmailWithPin
exports.deleteLoggedInUserAccount_v2 = auth.deleteLoggedInUserAccount
exports.verifyToken = auth.verifyToken

// Agora
exports.fetchAgoraRtcToken_v2 = agora.fetchAgoraRtcToken
exports.fetchAgoraRtmToken_v2 = agora.fetchAgoraRtmToken

// Backup
exports.exportFirestoreBackup_eu = backup.exportFirestoreBackup

// Admin Functions
exports.sendBasicTemplateEmail_v3 = admin.sendBasicTemplateEmail
exports.unsubscribeFromMarketingEmails_eu = admin.unsubscribeFromMarketingEmails

// Group Admin
exports[FUNCTION_NAMES.sendNewlyPublishedEventEmail] =
   groupAdmin.sendNewlyPublishedEventEmail
exports.getLivestreamReportData_v2 = groupAdmin.getLivestreamReportData
exports.sendDashboardInviteEmail = groupAdmin.sendDashboardInviteEmail
exports.joinGroupDashboard_eu = groupAdmin.joinGroupDashboard
exports.createGroup_eu = groupAdmin.createGroup
exports.changeRole_eu = groupAdmin.changeRole
exports.kickFromDashboard_eu = groupAdmin.kickFromDashboard

// Reminders (Old) TODO: delete functions in file after testing new reminders
exports.scheduleReminderEmails_eu = reminders.scheduleReminderEmails

exports.newsletter = newsletter.newsletter
exports.manualNewsletter = newsletter.manualNewsletter
exports.onboardingNewsletter = onboardingNewsletter.onboardingNewsletter
exports.manualOnboardingNewsletter =
   onboardingNewsletter.manualOnboardingNewsletter
exports[FUNCTION_NAMES.manualEndOfSparksTrialEmails] =
   endOfSparksTrials.manualEndOfSparksTrialEmails
exports[FUNCTION_NAMES.endOfSparksTrialEmails] =
   endOfSparksTrials.endOfSparksTrialEmails
exports.manualTemplatedEmail = newsletter.manualTemplatedEmail

// Notification Livestreams
exports.notifyUsersWhenLivestreamStarts =
   notificationLivestreams.notifyUsersWhenLivestreamStarts
exports.notifyUsersOnLivestreamStart =
   notificationLivestreams.notifyUsersOnLivestreamStart

// Notification Onboarding
exports.notificationOnboarding = notificationOnboardings.notificationOnboarding
exports.notificationOnboardingLivestream =
   notificationOnboardings.notificationOnboardingLivestream

// User
exports.updateUserLiveStreamDataOnUserChange =
   user.updateUserLiveStreamDataOnUserChange

// Stripe
exports.stripeWebHook = stripe.stripeWebHook
exports.fetchStripeCustomerSession = stripe.fetchStripeCustomerSession
exports.fetchStripePrice = stripe.fetchStripePrice
exports.fetchStripeSessionStatus = stripe.fetchStripeSessionStatus

// Livestreams
exports.sendLivestreamRegistrationConfirmationEmail_v6 =
   livestreams.livestreamRegistrationConfirmationEmail
exports[FUNCTION_NAMES.sendPhysicalEventRegistrationConfirmationEmail] =
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
exports[FUNCTION_NAMES.getRecommendedEvents] =
   recommendation.getRecommendedEvents

// On Write Triggers for all collections
exports.syncLivestreams = onWriteTriggers.syncLivestreams
exports.syncLivestreamStartNotifications =
   onWriteTriggers.syncLivestreamStartNotifications
exports.syncUserLivestreamData = onWriteTriggers.syncUserLivestreamData
exports.syncLivestreamStats = onWriteTriggers.syncLivestreamStats
exports.syncUserStats = onWriteTriggers.syncUserStats
exports.onWriteCreator = onWriteTriggers.onWriteCreator
exports.onWriteGroup = onWriteTriggers.onWriteGroup
exports.syncGroupFollowingUserDataOnChange =
   onWriteTriggers.syncGroupFollowingUserDataOnChange
exports.onWriteSpark = onWriteTriggers.onWriteSpark
exports.onWriteCustomJobs = onWriteTriggers.onWriteCustomJobs
exports.onWriteCustomJobsSendNotifications =
   onWriteTriggers.onWriteCustomJobsSendNotifications
exports.onWriteStudyBackground = onWriteTriggers.onWriteStudyBackground

// On Create Triggers for all collections
exports.onCreateLivestreamRatingAnswer =
   onCreateTriggers.onCreateLivestreamRatingAnswer
exports.onCreateUserData_v2 = onCreateTriggers.onCreateUserData
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
exports[FUNCTION_NAMES.createSparksFeedEventNotifications] =
   notificationSparks.createSparksFeedEventNotifications
exports[FUNCTION_NAMES.createUserSparksFeedEventNotifications] =
   notificationSparks.createUserSparksFeedEventNotifications
exports[FUNCTION_NAMES.removeAndSyncUserSparkNotification] =
   notificationSparks.removeAndSyncUserSparkNotification

// User Spark Functions
exports.getSparksFeed_v10 = userSparks.getSparksFeed
exports.markSparkAsSeenByUser_v6 = userSparks.markSparkAsSeenByUser

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
exports[FUNCTION_NAMES.startPlan] = groupPlans.startPlan
exports[FUNCTION_NAMES.sendReminderToNearEndSparksTrialPlanCreationPeriod] =
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
exports.syncFeaturedCompaniesData = companies.syncFeaturedCompaniesData
exports.trackGroupEvents = companies.trackGroupEvents

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
exports.fetchCountriesList = countries.fetchCountriesList
exports.searchCountries = countries.searchCountries
exports.searchCities = countries.searchCities
exports.fetchCountryCitiesList = countries.fetchCountryCitiesList
exports.fetchCountryStatesList = countries.fetchCountryStatesList
exports.fetchCountryCityData = countries.fetchCountryCityData
exports.fetchCityData = countries.fetchCityData
exports.fetchCountryData = countries.fetchCountryData
exports[FUNCTION_NAMES.searchLocations] = countries.searchLocations
exports[FUNCTION_NAMES.getLocation] = countries.getLocation
// Levels
exports.getFollowedCreators = levels.getFollowedCreators

// CustomerIO
exports.syncUserToCustomerIO = customerio.syncUserToCustomerIO
exports.customerIOWebhook = customerio.customerIOWebhook
exports[FUNCTION_NAMES.customerIORecommendedLivestreamsWebhook] =
   customerio.customerIORecommendedLivestreamsWebhook
exports[FUNCTION_NAMES.customerIORecommendedSparksWebhook] =
   customerio.customerIORecommendedSparksWebhook

// Reminders
exports.schedule5MinutesReminderEmails =
   remindersNew.schedule5MinutesReminderEmails
exports.schedule1HourReminderEmails = remindersNew.schedule1HourReminderEmails
exports.schedule24HoursReminderEmails =
   remindersNew.schedule24HoursReminderEmails
// For testing Reminders
exports.manualReminderEmails = remindersNew.manualReminderEmails

// Followups
exports.sendFollowupToNonAttendees = followups.sendFollowupToNonAttendees
exports.sendFollowupToAttendees = followups.sendFollowupToAttendees
exports.sendManualFollowup = followups.sendManualFollowup
exports.sendReminderEmailAboutApplicationLink_v2 =
   followups.sendReminderEmailAboutApplicationLink

// Reminders Post
exports[FUNCTION_NAMES.onLivestreamStartScheduleNoShowReminder] =
   remindersNoShow.onLivestreamStartScheduleNoShowReminder
exports[FUNCTION_NAMES.sendLivestreamNoShowReminder] =
   remindersNoShow.sendLivestreamNoShowReminder

// Keep-warm function
exports[FUNCTION_NAMES.keepFunctionsWarm] = warming.keepFunctionsWarm
