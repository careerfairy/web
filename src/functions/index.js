/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for t`he specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const dotenv = require('dotenv');

// load values from the .env file in this directory into process.env
dotenv.config();

// Imported Individual Cloud functions
const hosting = require('./hosting')
const auth = require('./auth')
const agora = require('./agora')
const backup = require('./backup')
const groupAdmin = require('./groupAdmin')
const reminders = require('./reminders')
const livestreams = require('./livestreams')
const universityEmails = require('./universityEmails')
const algolia = require('./algolia')
const analytics = require('./analytics')
const recording = require('./recording')
const breakoutRooms = require('./breakoutRooms')

// Hosting
exports.production = hosting.production
exports.testing = hosting.testing
exports.testing2 = hosting.testing2
exports.personalHabib = hosting.personalHabib

// Auth
exports.createNewUserAccount = auth.createNewUserAccount
exports.updateFakeUser = auth.updateFakeUser
exports.verifyEmailWithPin = auth.verifyEmailWithPin
exports.sendPostmarkResetPasswordEmail = auth.sendPostmarkResetPasswordEmail
exports.sendPostmarkEmailUserDataAndUni = auth.sendPostmarkEmailUserDataAndUni
exports.sendPostmarkEmailUserDataAndUniWithName = auth.sendPostmarkEmailUserDataAndUniWithName
exports.resendPostmarkEmailVerificationEmailWithPin = auth.resendPostmarkEmailVerificationEmailWithPin

// Agora
exports.generateAgoraToken = agora.generateAgoraToken
exports.generateAgoraTokenSecure = agora.generateAgoraTokenSecure
exports.generateAgoraTokenSecureOnCall = agora.generateAgoraTokenSecureOnCall
exports.startRecordingLivestream = agora.startRecordingLivestream

// Backup
exports.exportFirestoreBackup = backup.exportFirestoreBackup

// Group Admin
exports.sendDashboardInviteEmail = groupAdmin.sendDashboardInviteEmail
exports.sendDraftApprovalRequestEmail = groupAdmin.sendDraftApprovalRequestEmail

// Reminders
exports.sendReminderEmailToRegistrants = reminders.sendReminderEmailToRegistrants
exports.scheduleReminderEmailSendTestOnRun = reminders.scheduleReminderEmailSendTestOnRun
exports.sendReminderEmailToUserFromUniversity = reminders.sendReminderEmailToUserFromUniversity
exports.sendReminderEmailsWhenLivestreamStarts = reminders.sendReminderEmailsWhenLivestreamStarts

// Livestreams
exports.scheduleTestLivestreamDeletion = livestreams.scheduleTestLivestreamDeletion
exports.setFirstCommentOfQuestionOnCreate = livestreams.setFirstCommentOfQuestionOnCreate
exports.assertLivestreamRegistrationWasCompleted = livestreams.assertLivestreamRegistrationWasCompleted
exports.assertLivestreamDeregistrationWasCompleted = livestreams.assertLivestreamDeregistrationWasCompleted
exports.sendLivestreamRegistrationConfirmationEmail = livestreams.sendLivestreamRegistrationConfirmationEmail
exports.sendPhysicalEventRegistrationConfirmationEmail = livestreams.sendPhysicalEventRegistrationConfirmationEmail

// University Emails
exports.sendEmailToStudentOfUniversityAndField = universityEmails.sendEmailToStudentOfUniversityAndField

// Algolia
exports.addToIndex = algolia.addToIndex
exports.updateIndex = algolia.updateIndex
exports.deleteFromIndex = algolia.deleteFromIndex
exports.addToStreamIndex = algolia.addToStreamIndex
exports.updateStreamIndex = algolia.updateStreamIndex
exports.deleteStreamFromIndex = algolia.deleteStreamFromIndex

// Analytics
exports.updateUserDataAnalytcicsOnWrite = analytics.updateUserDataAnalyticsOnWrite

//Recording
exports.startRecordingLivestream = recording.startRecordingLivestream
exports.stopRecordingLivestream = recording.stopRecordingLivestream


// Breakout Rooms
exports.updateBreakoutRoomStatusOnWrite = breakoutRooms.updateBreakoutRoomStatusOnWrite
