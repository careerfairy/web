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
import universityEmails = require("./universityEmails")
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
import crisp = require("./crisp")
import recommendation = require("./recommendation")
import onWriteTriggers = require("./onWriteTriggers")
import onCreateTriggers = require("./onCreateTriggers")
import onDeleteTriggers = require("./onDeleteTriggers")
import { generateFunctionsFromBundles } from "./lib/bundleGenerator"
import { bundles } from "./bundles"
import newsletter = require("./newsletter")
import postmark = require("./postmark")

// load values from the .env file in this directory into process.env
dotenv.config()

// load values from the .env file in this directory into process.env
dotenv.config()

// Auth
exports.createNewUserAccount_eu = auth.createNewUserAccount
exports.createNewGroupAdminUserAccount_eu = auth.createNewGroupAdminUserAccount
exports.onUserUpdate = auth.onUserUpdate
exports.onUserStatsUpdate = auth.onUserStatsUpdate
exports.backfillUserData_eu = auth.backfillUserData
exports.validateUserEmailWithPin_eu = auth.validateUserEmailWithPin
exports.sendPostmarkResetPasswordEmail_eu = auth.sendPostmarkResetPasswordEmail
exports.resendPostmarkEmailVerificationEmailWithPin_eu =
   auth.resendPostmarkEmailVerificationEmailWithPin
exports.deleteLoggedInUserAccount_eu = auth.deleteLoggedInUserAccount

// Agora
exports.fetchAgoraRtcToken = agora.fetchAgoraRtcToken
exports.fetchAgoraRtmToken = agora.fetchAgoraRtmToken

// Backup
exports.exportFirestoreBackup = backup.exportFirestoreBackup

// Admin Functions
exports.sendBasicTemplateEmail_v5 = admin.sendBasicTemplateEmail
exports.unsubscribeFromMarketingEmails = admin.unsubscribeFromMarketingEmails

// Group Admin
exports.sendDashboardInviteEmail_v2 = groupAdmin.sendDashboardInviteEmail_v2
exports.sendDraftApprovalRequestEmail_v2 =
   groupAdmin.sendDraftApprovalRequestEmail
exports.sendNewlyPublishedEventEmail = groupAdmin.sendNewlyPublishedEventEmail
exports.getLivestreamReportData_v4 = groupAdmin.getLivestreamReportData_v4
exports.joinGroupDashboard_v2 = groupAdmin.joinGroupDashboard_v2
exports.deleteGroupAdminDashboardInvite =
   groupAdmin.deleteGroupAdminDashboardInvite
exports.createGroup = groupAdmin.createGroup
exports.changeRole = groupAdmin.changeRole
exports.kickFromDashboard_v2 = groupAdmin.kickFromDashboard_v2

// Reminders
exports.sendReminderEmailToRegistrants =
   reminders.sendReminderEmailToRegistrants
exports.sendReminderEmailAboutApplicationLink =
   reminders.sendReminderEmailAboutApplicationLink
exports.scheduleReminderEmails = reminders.scheduleReminderEmails
exports.sendReminderToNonAttendees = reminders.sendReminderToNonAttendees
exports.sendReminderForNonAttendeesByStreamId =
   reminders.sendReminderForNonAttendeesByStreamId

exports.newsletter = newsletter.newsletter
exports.manualNewsletter = newsletter.manualNewsletter

// Livestreams
exports.scheduleTestLivestreamDeletion =
   livestreams.scheduleTestLivestreamDeletion
exports.setFirstCommentOfQuestionOnCreate =
   livestreams.setFirstCommentOfQuestionOnCreate
exports.sendLivestreamRegistrationConfirmationEmail_v2 =
   livestreams.sendLivestreamRegistrationConfirmationEmail_v2
exports.sendPhysicalEventRegistrationConfirmationEmail =
   livestreams.sendPhysicalEventRegistrationConfirmationEmail
exports.sendHybridEventRegistrationConfirmationEmail =
   livestreams.sendHybridEventRegistrationConfirmationEmail
exports.notifySlackWhenALivestreamStarts =
   livestreams.notifySlackWhenALivestreamStarts
exports.notifySlackWhenALivestreamIsCreated =
   livestreams.notifySlackWhenALivestreamIsCreated
exports.getLivestreamICalendarEvent = livestreams.getLivestreamICalendarEvent

// Postmark webhooks
exports.postmarkWebhook = postmark.postmarkWebhook

// University Emails
exports.sendEmailToStudentOfUniversityAndField =
   universityEmails.sendEmailToStudentOfUniversityAndField

// Deploy each bundle as a separate function
// npx firelink deploy --only functions:bundle-allFutureLivestreams
//
// When adding new bundles, you probably also want to update the
// Firebase Hosting mappings: npx firebase deploy --only hosting
exports.bundle = generateFunctionsFromBundles(bundles)

// Algolia
// exports.addToIndex = algolia.addToIndex
// exports.updateIndex = algolia.updateIndex
// exports.deleteFromIndex = algolia.deleteFromIndex
// exports.addToStreamIndex = algolia.addToStreamIndex
// exports.updateStreamIndex = algolia.updateStreamIndex
// exports.deleteStreamFromIndex = algolia.deleteStreamFromIndex

// Analytics
exports.updateUserDataAnalytcicsOnWrite =
   analytics.updateUserDataAnalyticsOnWrite

// Recording
exports.startRecordingLivestream_v2 = recording.startRecordingLivestream
exports.stopRecordingLivestream_v2 = recording.stopRecordingLivestream
exports.automaticallyRecordLivestream = recording.automaticallyRecordLivestream
exports.automaticallyRecordLivestreamBreakoutRoom =
   recording.automaticallyRecordLivestreamBreakoutRoom
exports.checkForUnfinishedLivestreamsAndStopRecording =
   recording.checkForUnfinishedLivestreamsAndStopRecording

// Breakout Rooms
exports.updateBreakoutRoomStatusOnWrite =
   breakoutRooms.updateBreakoutRoomStatusOnWrite

// Slack Interaction Handler
exports.slackHandleInteractions = slack.slackHandleInteractions

// Rewards
exports.rewardLivestreamInvitationComplete_eu =
   rewards.rewardLivestreamInvitationComplete
exports.rewardUserAction = rewards.rewardUserAction
exports.applyReferralCode_eu = rewards.applyReferralCode

// Ratings
exports.onUserRateWish = wishes.onUserRateWish

// CMS
exports.syncFieldsOfStudyToHygraph = cms.syncFieldsOfStudyToHygraph

// Marketing
exports.createMarketingUser = marketing.createMarketingUser

// ATS
// Group
exports.mergeGenerateLinkToken = atsGroup.mergeGenerateLinkToken
exports.mergeGetAccountToken = atsGroup.mergeGetAccountToken
exports.mergeMetaEndpoint = atsGroup.mergeMetaEndpoint
exports.mergeRemoveAccount = atsGroup.mergeRemoveAccount
exports.fetchATSJobs_v2 = atsGroup.fetchATSJobs
exports.fetchATSRecruiters = atsGroup.fetchATSRecruiters
exports.fetchATSSyncStatus = atsGroup.fetchATSSyncStatus
exports.candidateApplicationTest = atsGroup.candidateApplicationTest

// User
exports.atsUserApplyToJob = atsUser.atsUserApplyToJob
exports.fetchLivestreamJobs = atsUser.fetchLivestreamJobs
exports.updateUserJobApplications = atsUser.updateUserJobApplications

// BigQuery
exports.getBigQueryUsers_v3 = bigQuery.getBigQueryUsers_v3

// Group Analytics
exports.getRegistrationSources_v2 = groupAnalytics.getRegistrationSources

// Clear cached documents
exports.periodicallyRemoveCachedDocument =
   cacheClear.periodicallyRemoveCachedDocument

// Crisp
exports.getCrispSignature = crisp.getCrispSignature

// Recommendations
exports.getRecommendedEvents_v4 = recommendation.getRecommendedEvents

// On Write Triggers for all collections
exports.syncLivestreams = onWriteTriggers.syncLivestreams
exports.syncUserLivestreamData = onWriteTriggers.syncUserLivestreamData
exports.syncLivestreamStats = onWriteTriggers.syncLivestreamStats
exports.syncUserStats = onWriteTriggers.syncUserStats

// On Create Triggers for all collections
exports.onCreateLivestreamPopularityEvents =
   onCreateTriggers.onCreateLivestreamPopularityEvents
exports.onCreateLivestreamRatingAnswer =
   onCreateTriggers.onCreateLivestreamRatingAnswer
exports.onCreateUserData = onCreateTriggers.onCreateUserData
exports.onCreateReward = onCreateTriggers.onCreateReward
exports.onCreateUserLivestreamData = onCreateTriggers.onCreateUserLivestreamData

// On Delete Triggers for all collections
exports.onDeleteLivestreamPopularityEvents =
   onDeleteTriggers.onDeleteLivestreamPopularityEvents
