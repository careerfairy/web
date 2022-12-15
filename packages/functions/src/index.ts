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

// load values from the .env file in this directory into process.env
dotenv.config()

// load values from the .env file in this directory into process.env
dotenv.config()

// Auth
exports.createNewUserAccount_v4 = auth.createNewUserAccount_v4
exports.createNewGroupAdminUserAccount = auth.createNewGroupAdminUserAccount
exports.onUserUpdate = auth.onUserUpdate
exports.onUserStatsUpdate = auth.onUserStatsUpdate
exports.backfillUserData = auth.backfillUserData
exports.updateFakeUser = auth.updateFakeUser
exports.validateUserEmailWithPin_v2 = auth.validateUserEmailWithPin_v2
exports.sendPostmarkResetPasswordEmail_v3 =
   auth.sendPostmarkResetPasswordEmail_v3
exports.sendPostmarkEmailUserDataAndUni = auth.sendPostmarkEmailUserDataAndUni
exports.sendPostmarkEmailUserDataAndUniWithName =
   auth.sendPostmarkEmailUserDataAndUniWithName
exports.resendPostmarkEmailVerificationEmailWithPin_v2 =
   auth.resendPostmarkEmailVerificationEmailWithPin_v2
exports.deleteLoggedInUserAccount = auth.deleteLoggedInUserAccount

// Agora
exports.fetchAgoraRtcToken = agora.fetchAgoraRtcToken
exports.fetchAgoraRtmToken = agora.fetchAgoraRtmToken

// Backup
exports.exportFirestoreBackup = backup.exportFirestoreBackup

// Admin Functions
exports.sendBasicTemplateEmail_v6 = admin.sendBasicTemplateEmail_v6
exports.unsubscribeFromMarketingEmails = admin.unsubscribeFromMarketingEmails

// Group Admin
exports.sendDashboardInviteEmail_v3 = groupAdmin.sendDashboardInviteEmail_v3
exports.sendDraftApprovalRequestEmail_v2 =
   groupAdmin.sendDraftApprovalRequestEmail_v2
exports.sendNewlyPublishedEventEmail_v2 =
   groupAdmin.sendNewlyPublishedEventEmail_v2
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
exports.sendReminderEmailAboutApplicationLink_v2 =
   reminders.sendReminderEmailAboutApplicationLink_v2
exports.scheduleReminderEmails = reminders.scheduleReminderEmails

// Livestreams
exports.scheduleTestLivestreamDeletion =
   livestreams.scheduleTestLivestreamDeletion
exports.setFirstCommentOfQuestionOnCreate =
   livestreams.setFirstCommentOfQuestionOnCreate
exports.sendLivestreamRegistrationConfirmationEmail_v3 =
   livestreams.sendLivestreamRegistrationConfirmationEmail_v3
exports.sendPhysicalEventRegistrationConfirmationEmail =
   livestreams.sendPhysicalEventRegistrationConfirmationEmail
exports.sendHybridEventRegistrationConfirmationEmail_v2 =
   livestreams.sendHybridEventRegistrationConfirmationEmail_v2
exports.notifySlackWhenALivestreamStarts =
   livestreams.notifySlackWhenALivestreamStarts
exports.notifySlackWhenALivestreamIsCreated =
   livestreams.notifySlackWhenALivestreamIsCreated
exports.getLivestreamICalendarEvent = livestreams.getLivestreamICalendarEvent

// University Emails
exports.sendEmailToStudentOfUniversityAndField =
   universityEmails.sendEmailToStudentOfUniversityAndField

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

// Breakout Rooms
exports.updateBreakoutRoomStatusOnWrite =
   breakoutRooms.updateBreakoutRoomStatusOnWrite

// Slack Interaction Handler
exports.slackHandleInteractions = slack.slackHandleInteractions

// Rewards
exports.rewardApply = rewards.rewardApply
exports.rewardLivestreamAttendance = rewards.rewardLivestreamAttendance
exports.rewardLivestreamRegistrant = rewards.rewardLivestreamRegistrant
exports.rewardUserAction = rewards.rewardUserAction
exports.applyReferralCode = rewards.applyReferralCode

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
exports.mergeRemoveAccount = atsGroup.mergeRemoveAccount
exports.fetchATSJobs_v2 = atsGroup.fetchATSJobs
exports.fetchATSSyncStatus = atsGroup.fetchATSSyncStatus

// User
exports.atsUserApplyToJob = atsUser.atsUserApplyToJob
exports.fetchLivestreamJobs = atsUser.fetchLivestreamJobs
exports.updateUserJobApplications = atsUser.updateUserJobApplications

// BigQuery
exports.getBigQueryUsers_v2 = bigQuery.getBigQueryUsers_v2

// Group Analytics
exports.getRegistrationSources = groupAnalytics.getRegistrationSources

// Clear cached documents
exports.periodicallyRemoveCachedDocument =
   cacheClear.periodicallyRemoveCachedDocument

// Crisp
exports.getCrispSignature = crisp.getCrispSignature

// Recommendations
exports.getRecommendedEvents = recommendation.getRecommendedEvents
