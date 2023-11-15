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

// Imported Individual Cloud functions
import auth = require("./auth")
import agora = require("./agora")
import backup = require("./backup")
import groupAdmin = require("./groupAdmin")
import admin = require("./admin")
import reminders = require("./reminders")
import livestreams = require("./livestreams")
// import algolia = require("./algolia")
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
import { generateFunctionsFromBundles } from "./lib/bundleGenerator"
import { bundles } from "./bundles"
import newsletter = require("./newsletter")
import postmark = require("./postmark")
import groupSparks = require("./groupSparks")
import userSparks = require("./userSparks")
import customJobs = require("./customJobs")
import notificationSparks = require("./notificationSparks")

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
exports.fetchAgoraRtcToken_eu = agora.fetchAgoraRtcToken
exports.fetchAgoraRtmToken_eu = agora.fetchAgoraRtmToken

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
exports.getLivestreamReportData_eu = groupAdmin.getLivestreamReportData
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

// Livestreams
exports.setFirstCommentOfQuestionOnCreate =
   livestreams.setFirstCommentOfQuestionOnCreate
exports.sendLivestreamRegistrationConfirmationEmail_v2 =
   livestreams.sendLivestreamRegistrationConfirmationEmail
exports.sendPhysicalEventRegistrationConfirmationEmail_eu =
   livestreams.sendPhysicalEventRegistrationConfirmationEmail
exports.sendHybridEventRegistrationConfirmationEmail_eu =
   livestreams.sendHybridEventRegistrationConfirmationEmail
exports.notifySlackWhenALivestreamStarts =
   livestreams.notifySlackWhenALivestreamStarts
exports.notifySlackWhenALivestreamIsCreated =
   livestreams.notifySlackWhenALivestreamIsCreated
exports.getLivestreamICalendarEvent_v2 = livestreams.getLivestreamICalendarEvent
exports.fetchLivestreams_v2 = livestreams.fetchLivestreams

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
exports.rewardUserAction_eu = rewards.rewardUserAction
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
exports.getRecommendedEvents_v2 = recommendation.getRecommendedEvents

// On Write Triggers for all collections
exports.syncLivestreams = onWriteTriggers.syncLivestreams
exports.syncUserLivestreamData = onWriteTriggers.syncUserLivestreamData
exports.syncLivestreamStats = onWriteTriggers.syncLivestreamStats
exports.syncUserStats = onWriteTriggers.syncUserStats
exports.onWriteCreator = onWriteTriggers.onWriteCreator
exports.onWriteGroup = onWriteTriggers.onWriteGroup
exports.onWriteSpark = onWriteTriggers.onWriteSpark
exports.onWriteCustomJobs = onWriteTriggers.onWriteCustomJobs

// On Create Triggers for all collections
exports.onCreateLivestreamPopularityEvents =
   onCreateTriggers.onCreateLivestreamPopularityEvents
exports.onCreateLivestreamRatingAnswer =
   onCreateTriggers.onCreateLivestreamRatingAnswer
exports.onCreateUserData = onCreateTriggers.onCreateUserData
exports.onCreateReward = onCreateTriggers.onCreateReward
exports.onCreateUserLivestreamData = onCreateTriggers.onCreateUserLivestreamData
exports.onCreateUserSparkFeed = onCreateTriggers.onCreateUserSparkFeed
exports.onCreateSparkStats = onCreateTriggers.onCreateSparkStats

// On Delete Triggers for all collections
exports.onDeleteLivestreamPopularityEvents =
   onDeleteTriggers.onDeleteLivestreamPopularityEvents
exports.onDeleteUserSparkFeed = onDeleteTriggers.onDeleteUserSparkFeed

// Group Spark Functions
exports.createSpark_v2 = groupSparks.createSpark
exports.updateSpark_v2 = groupSparks.updateSpark
exports.deleteSpark_v2 = groupSparks.deleteSpark

// User Spark Notification Functions
exports.createSparksFeedEventNotifications =
   notificationSparks.createSparksFeedEventNotifications
exports.createUserSparksFeedEventNotifications_v2 =
   notificationSparks.createUserSparksFeedEventNotifications
exports.removeAndSyncUserSparkNotification_v2 =
   notificationSparks.removeAndSyncUserSparkNotification

// User Spark Functions
exports.getSparksFeed = userSparks.getSparksFeed
exports.markSparkAsSeenByUser = userSparks.markSparkAsSeenByUser

// Spark Analytics Functions
exports.trackSparkEvents_v2 = userSparks.trackSparkEvents
exports.trackSparkSecondsWatched_v2 = userSparks.trackSparkSecondsWatched

// Custom Jobs
exports.userApplyToCustomJob = customJobs.userApplyToCustomJob
