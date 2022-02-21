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
"use strict";

const dotenv = require("dotenv");

// load values from the .env file in this directory into process.env
dotenv.config();

// Imported Individual Cloud functions
const auth = require("./auth");
const agora = require("./agora");
const backup = require("./backup");
const groupAdmin = require("./groupAdmin");
const admin = require("./admin");
const reminders = require("./reminders");
const livestreams = require("./livestreams");
const universityEmails = require("./universityEmails");
const algolia = require("./algolia");
const analytics = require("./analytics");
const breakoutRooms = require("./breakoutRooms");
const recording = require("./recording");

// Auth
exports.createNewUserAccount = auth.createNewUserAccount;
exports.updateFakeUser = auth.updateFakeUser;
exports.createUserCopy = auth.createUserCopy;
exports.verifyEmailWithPin = auth.verifyEmailWithPin;
exports.validateUserEmailWithPin = auth.validateUserEmailWithPin;
exports.sendPostmarkResetPasswordEmail = auth.sendPostmarkResetPasswordEmail;
exports.sendPostmarkEmailUserDataAndUni = auth.sendPostmarkEmailUserDataAndUni;
exports.sendPostmarkEmailUserDataAndUniWithName =
   auth.sendPostmarkEmailUserDataAndUniWithName;
exports.resendPostmarkEmailVerificationEmailWithPin =
   auth.resendPostmarkEmailVerificationEmailWithPin;
exports.updateUsersCollectionOnUserDataUpdated =
   auth.updateUsersCollectionOnUserDataUpdated;

// Agora
exports.generateAgoraToken = agora.generateAgoraToken;
exports.generateAgoraTokenSecureOnCall = agora.generateAgoraTokenSecureOnCall;
exports.fetchAgoraRtcToken = agora.fetchAgoraRtcToken;
exports.fetchAgoraRtmToken = agora.fetchAgoraRtmToken;

// // Backup
// exports.exportFirestoreBackup = backup.exportFirestoreBackup;

// Admin Functions
exports.sendBasicTemplateEmail = admin.sendBasicTemplateEmail;

// Group Admin
exports.sendDashboardInviteEmail = groupAdmin.sendDashboardInviteEmail;
exports.sendDraftApprovalRequestEmail =
   groupAdmin.sendDraftApprovalRequestEmail;
exports.sendNewlyPublishedEventEmail = groupAdmin.sendNewlyPublishedEventEmail;
exports.getLivestreamReportData = groupAdmin.getLivestreamReportData;
exports.updateUserDocAdminStatus = groupAdmin.updateUserDocAdminStatus;
exports.joinGroupDashboard = groupAdmin.joinGroupDashboard;

// Reminders
exports.sendReminderEmailToRegistrants =
   reminders.sendReminderEmailToRegistrants;
exports.scheduleReminderEmailSendTestOnRun =
   reminders.scheduleReminderEmailSendTestOnRun;
exports.scheduleReminderEmailSFor2HoursBefore =
   reminders.scheduleReminderEmailSFor2HoursBefore;
exports.scheduleReminderEmailSFor20MinutesBefore =
   reminders.scheduleReminderEmailSFor20MinutesBefore;
exports.sendReminderEmailToUserFromUniversity =
   reminders.sendReminderEmailToUserFromUniversity;
exports.sendReminderEmailsWhenLivestreamStarts =
   reminders.sendReminderEmailsWhenLivestreamStarts;
exports.sendReminderEmailAboutApplicationLink =
   reminders.sendReminderEmailAboutApplicationLink;

// Livestreams
exports.scheduleTestLivestreamDeletion =
   livestreams.scheduleTestLivestreamDeletion;
exports.setFirstCommentOfQuestionOnCreate =
   livestreams.setFirstCommentOfQuestionOnCreate;
exports.assertLivestreamRegistrationWasCompleted =
   livestreams.assertLivestreamRegistrationWasCompleted;
exports.assertLivestreamDeregistrationWasCompleted =
   livestreams.assertLivestreamDeregistrationWasCompleted;
exports.sendLivestreamRegistrationConfirmationEmail =
   livestreams.sendLivestreamRegistrationConfirmationEmail;
exports.sendPhysicalEventRegistrationConfirmationEmail =
   livestreams.sendPhysicalEventRegistrationConfirmationEmail;
exports.sendHybridEventRegistrationConfirmationEmail =
   livestreams.sendHybridEventRegistrationConfirmationEmail;

// University Emails
exports.sendEmailToStudentOfUniversityAndField =
   universityEmails.sendEmailToStudentOfUniversityAndField;

// Algolia
exports.addToIndex = algolia.addToIndex;
exports.updateIndex = algolia.updateIndex;
exports.deleteFromIndex = algolia.deleteFromIndex;
exports.addToStreamIndex = algolia.addToStreamIndex;
exports.updateStreamIndex = algolia.updateStreamIndex;
exports.deleteStreamFromIndex = algolia.deleteStreamFromIndex;

// Analytics
exports.updateUserDataAnalytcicsOnWrite =
   analytics.updateUserDataAnalyticsOnWrite;

//Recording
exports.startRecordingLivestream = recording.startRecordingLivestream;
exports.stopRecordingLivestream = recording.stopRecordingLivestream;
exports.startRecordingBreakoutRoom = recording.startRecordingBreakoutRoom;
exports.stopRecordingBreakoutRoom = recording.stopRecordingBreakoutRoom;
exports.startRecordingLivestreamApi = recording.startRecordingLivestreamApi;
exports.stopRecordingLivestreamApi = recording.stopRecordingLivestreamApi;

// Breakout Rooms
exports.updateBreakoutRoomStatusOnWrite =
   breakoutRooms.updateBreakoutRoomStatusOnWrite;
