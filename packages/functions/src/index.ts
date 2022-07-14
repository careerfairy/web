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
import algolia = require("./algolia")
import analytics = require("./analytics")
import breakoutRooms = require("./breakoutRooms")
import recording = require("./recording")
import slack = require("./slack")
import rewards = require("./rewards")
import wishes = require("./wishes")

// Auth
exports.createNewUserAccount_v2 = auth.createNewUserAccount_v2
exports.onUserUpdate = auth.onUserUpdate
exports.onUserStatsUpdate = auth.onUserStatsUpdate
exports.backfillUserData = auth.backfillUserData
exports.updateFakeUser = auth.updateFakeUser
exports.validateUserEmailWithPin = auth.validateUserEmailWithPin
exports.sendPostmarkResetPasswordEmail_v2 =
   auth.sendPostmarkResetPasswordEmail_v2
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
exports.sendBasicTemplateEmail = admin.sendBasicTemplateEmail

// Group Admin
exports.sendDashboardInviteEmail = groupAdmin.sendDashboardInviteEmail
exports.sendDraftApprovalRequestEmail = groupAdmin.sendDraftApprovalRequestEmail
exports.sendNewlyPublishedEventEmail = groupAdmin.sendNewlyPublishedEventEmail
exports.getLivestreamReportData_v4 = groupAdmin.getLivestreamReportData_v4
exports.updateUserDocAdminStatus = groupAdmin.updateUserDocAdminStatus
exports.joinGroupDashboard = groupAdmin.joinGroupDashboard

// Reminders
exports.sendReminderEmailToRegistrants =
   reminders.sendReminderEmailToRegistrants
exports.scheduleReminderEmailSFor2HoursBefore =
   reminders.scheduleReminderEmailSFor2HoursBefore
exports.scheduleReminderEmailSFor20MinutesBefore =
   reminders.scheduleReminderEmailSFor20MinutesBefore
exports.sendReminderEmailToUserFromUniversity =
   reminders.sendReminderEmailToUserFromUniversity
exports.sendReminderEmailsWhenLivestreamStarts =
   reminders.sendReminderEmailsWhenLivestreamStarts
exports.sendReminderEmailAboutApplicationLink =
   reminders.sendReminderEmailAboutApplicationLink

// Livestreams
exports.scheduleTestLivestreamDeletion =
   livestreams.scheduleTestLivestreamDeletion
exports.setFirstCommentOfQuestionOnCreate =
   livestreams.setFirstCommentOfQuestionOnCreate
exports.assertLivestreamRegistrationWasCompleted =
   livestreams.assertLivestreamRegistrationWasCompleted
exports.assertLivestreamDeregistrationWasCompleted =
   livestreams.assertLivestreamDeregistrationWasCompleted
exports.sendLivestreamRegistrationConfirmationEmail =
   livestreams.sendLivestreamRegistrationConfirmationEmail
exports.sendPhysicalEventRegistrationConfirmationEmail =
   livestreams.sendPhysicalEventRegistrationConfirmationEmail
exports.sendHybridEventRegistrationConfirmationEmail =
   livestreams.sendHybridEventRegistrationConfirmationEmail
exports.notifySlackWhenALivestreamStarts =
   livestreams.notifySlackWhenALivestreamStarts
exports.notifySlackWhenALivestreamIsCreated =
   livestreams.notifySlackWhenALivestreamIsCreated

// University Emails
exports.sendEmailToStudentOfUniversityAndField =
   universityEmails.sendEmailToStudentOfUniversityAndField

// Algolia
exports.addToIndex = algolia.addToIndex
exports.updateIndex = algolia.updateIndex
exports.deleteFromIndex = algolia.deleteFromIndex
exports.addToStreamIndex = algolia.addToStreamIndex
exports.updateStreamIndex = algolia.updateStreamIndex
exports.deleteStreamFromIndex = algolia.deleteStreamFromIndex

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

// Ratings

exports.onUserRateWish = wishes.onUserRateWish
