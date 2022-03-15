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

import dotenv = require("dotenv");

// load values from the .env file in this directory into process.env
dotenv.config();

// Imported Individual Cloud functions
import auth = require("./auth");
import agora = require("./agora");
import backup = require("./backup");
import groupAdmin = require("./groupAdmin");
import admin = require("./admin");
import reminders = require("./reminders");
import livestreams = require("./livestreams");
import universityEmails = require("./universityEmails");
import algolia = require("./algolia");
import analytics = require("./analytics");
import breakoutRooms = require("./breakoutRooms");
import recording = require("./recording");
import slack = require("./slack");
import rewards = require("./rewards");

// Auth
exports.createNewUserAccount_v2 = auth.createNewUserAccount_v2;
exports.backfillUserData = auth.backfillUserData;
exports.updateFakeUser = auth.updateFakeUser;
exports.validateUserEmailWithPin = auth.validateUserEmailWithPin;
exports.sendPostmarkResetPasswordEmail = auth.sendPostmarkResetPasswordEmail;
exports.sendPostmarkEmailUserDataAndUni = auth.sendPostmarkEmailUserDataAndUni;
exports.sendPostmarkEmailUserDataAndUniWithName =
   auth.sendPostmarkEmailUserDataAndUniWithName;
exports.resendPostmarkEmailVerificationEmailWithPin =
   auth.resendPostmarkEmailVerificationEmailWithPin;

// Agora
exports.generateAgoraToken = agora.generateAgoraToken;
exports.generateAgoraTokenSecureOnCall = agora.generateAgoraTokenSecureOnCall;
exports.fetchAgoraRtcToken = agora.fetchAgoraRtcToken;
exports.fetchAgoraRtmToken = agora.fetchAgoraRtmToken;

// Backup
exports.exportFirestoreBackup = backup.exportFirestoreBackup;

// Admin Functions
exports.sendBasicTemplateEmail = admin.sendBasicTemplateEmail;

// Group Admin
exports.sendDashboardInviteEmail = groupAdmin.sendDashboardInviteEmail;
exports.sendDraftApprovalRequestEmail =
   groupAdmin.sendDraftApprovalRequestEmail;
exports.sendNewlyPublishedEventEmail = groupAdmin.sendNewlyPublishedEventEmail;
exports.getLivestreamReportData = groupAdmin.getLivestreamReportData;
exports.getLivestreamReportData_TEMP_NAME =
   groupAdmin.getLivestreamReportData_TEMP_NAME;
exports.updateUserDocAdminStatus = groupAdmin.updateUserDocAdminStatus;
exports.joinGroupDashboard = groupAdmin.joinGroupDashboard;

// Reminders
exports.sendReminderEmailToRegistrants =
   reminders.sendReminderEmailToRegistrants;
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
exports.notifySlackWhenALivestreamStarts =
   livestreams.notifySlackWhenALivestreamStarts;
exports.notifySlackWhenALivestreamIsCreated =
   livestreams.notifySlackWhenALivestreamIsCreated;

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

// Recording
exports.startRecordingLivestream = recording.startRecordingLivestream;
exports.stopRecordingLivestream = recording.stopRecordingLivestream;
exports.startRecordingBreakoutRoom = recording.startRecordingBreakoutRoom;
exports.stopRecordingBreakoutRoom = recording.stopRecordingBreakoutRoom;
exports.startRecordingLivestreamApi = recording.startRecordingLivestreamApi;
exports.stopRecordingLivestreamApi = recording.stopRecordingLivestreamApi;

// Breakout Rooms
exports.updateBreakoutRoomStatusOnWrite =
   breakoutRooms.updateBreakoutRoomStatusOnWrite;

// Slack Interaction Handler
exports.slackHandleInteractions = slack.slackHandleInteractions;

// Rewards
exports.rewardApply = rewards.rewardApply;
exports.rewardLivestreamAttendance = rewards.rewardLivestreamAttendance;
