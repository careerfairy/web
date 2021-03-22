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
const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require('./keys/admin.json');


// Imported Group Cloud functions

exports.algolia = require('./algolia');

// Imported Individual Cloud functions

const hosting = require('./hosting')
const auth = require('./auth')
const agora = require('./agora')

// Hosting
exports.production = hosting.production

exports.testing = hosting.testing

exports.testing2 = hosting.testing2


// Auth
exports.resendPostmarkEmailVerificationEmailWithPin = auth.resendPostmarkEmailVerificationEmailWithPin

exports.sendPostmarkEmailUserDataAndUniWithName = auth.sendPostmarkEmailUserDataAndUniWithName
exports.sendPostmarkEmailUserDataAndUni = auth.sendPostmarkEmailUserDataAndUni

exports.sendPostmarkResetPasswordEmail = auth.sendPostmarkResetPasswordEmail
exports.verifyEmailWithPin = auth.verifyEmailWithPin
exports.updateFakeUser = auth.updateFakeUser


// Agora
exports.generateAgoraToken = agora.generateAgoraToken

exports.generateAgoraTokenSecure = agora.generateAgoraTokenSecure

exports.startRecordingLivestream = agora.startRecordingLivestream



// load values from the .env file in this directory into process.env
dotenv.config();


// configure algolia


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


var api_key = '13db35c5779d693ddad243d21e9d5cba-e566273b-b2967fc4';
var domain = 'mail.careerfairy.io';
var host = 'api.eu.mailgun.net';

const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain, host: host});
var {DateTime} = require('luxon');


// Http functions

const postmark = require("postmark");
var serverToken = "3f6d5713-5461-4453-adfd-71f5fdad4e63";
var client = new postmark.ServerClient(serverToken);





exports.sendLivestreamRegistrationConfirmationEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const email = {
        "TemplateId": 16533319,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": req.body.recipientEmail,
        "TemplateModel": {
            user_first_name: req.body.user_first_name,
            livestream_date: req.body.livestream_date,
            company_name: req.body.company_name,
            company_logo_url: req.body.company_logo_url,
            livestream_title: req.body.livestream_title,
            livestream_link: req.body.livestream_link
        }
    };

    client.sendEmailWithTemplate(email).then(response => {
        return res.send(200);
    }, error => {
        console.log('error:' + error);
        return res.status(400).send(error);
    });
});

exports.sendPhysicalEventRegistrationConfirmationEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const email = {
        "TemplateId": 20754935,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": req.body.recipientEmail,
        "TemplateModel": {
            user_first_name: req.body.user_first_name,
            event_date: req.body.event_date,
            company_name: req.body.company_name,
            company_logo_url: req.body.company_logo_url,
            event_title: req.body.event_title,
            event_address: req.body.event_address
        }
    };

    client.sendEmailWithTemplate(email).then(response => {
        return res.send(200);
    }, error => {
        console.log('error:' + error);
        return res.status(400).send(error);
    });
});
exports.sendDashboardInviteEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const email = {
        "TemplateId": 22272783,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": req.body.recipientEmail,
        "TemplateModel": {
            sender_first_name: req.body.sender_first_name,
            group_name: req.body.group_name,
            invite_link: req.body.invite_link,
        }
    };

    client.sendEmailWithTemplate(email).then(response => {
        return res.send(200);
    }, error => {
        console.log('error:' + error);
        return res.status(400).send(error);
    });
});

exports.sendDraftApprovalRequestEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const adminsInfo = req.body.adminsInfo || []

    functions.logger.log("admins Info in approval request", adminsInfo)

    const emails = adminsInfo.map(({email, link}) => ({
        "TemplateId": 22299429,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": email,
        "TemplateModel": {
            sender_name: req.body.sender_name,
            livestream_title: req.body.livestream_title,
            livestream_company_name: req.body.livestream_company_name,
            draft_stream_link: link,
            submit_time: req.body.submit_time,
        }
    }))

    client.sendEmailBatchWithTemplates(emails).then(responses => {
        responses.forEach(response => functions.logger.log('sent batch DraftApprovalRequestEmail email with response:', response))
        return res.send(200);
    }, error => {
        console.log('error:' + error);
        return res.status(400).send(error);
    });
});



exports.sendReminderEmailToUserFromUniversity = functions.https.onRequest(async (req, res) => {

    console.log("running");

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    let counter = 0;

    let groupId = req.body.groupId;
    let categoryId = req.body.categoryId;
    let categoryValueId = req.body.categoryValueId;

    let collectionRef = admin.firestore().collection("userData")
        .where("groupIds", "array-contains", groupId);

    collectionRef.get()
        .then((querySnapshot) => {
            console.log("snapshotSize:" + querySnapshot.size);
            querySnapshot.forEach(doc => {
                var id = doc.id;
                var userData = doc.data()
                let groupCategory = userData.registeredGroups.find(group => group.groupId === groupId);
                if (groupCategory) {
                    let filteringCategory = groupCategory.categories.find(category => category.id === categoryId);
                    if (filteringCategory && filteringCategory.selectedValueId === categoryValueId) {
                        console.log(userData.userEmail)
                        counter++;
                        const email = {
                            "TemplateId": req.body.templateId,
                            "From": 'CareerFairy <noreply@careerfairy.io>',
                            "To": userData.userEmail,
                            "TemplateModel": {
                                userEmail: userData.userEmail
                            }
                        };
                        client.sendEmailWithTemplate(email).then(() => {
                            console.log("email sent to: " + userData.userEmail);
                        }, error => {
                            console.log('error:' + error);
                        });
                    }
                }
            });
        }).catch(error => {
        console.log('error:' + error);
        return res.status(400).send();
    })
});




const axios = require('axios');





exports.sendReminderEmailToRegistrants = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    let registeredUsers = [];
    admin.firestore().collection("livestreams").doc(req.body.livestreamId).get()
        .then((doc) => {
            registeredUsers = doc.data().registeredUsers;
            var itemsProcessed = 0;
            registeredUsers.forEach(userEmail => {
                const email = {
                    "TemplateId": req.body.templateId,
                    "From": 'CareerFairy <noreply@careerfairy.io>',
                    "To": userEmail,
                    "TemplateModel": {}
                };
                client.sendEmailWithTemplate(email).then(() => {
                    console.log("email sent to: " + userEmail);
                    itemsProcessed++;
                    if (itemsProcessed === registeredUsers.length) {
                        return res.status(200).send();
                    }
                }, error => {
                    console.log('error:' + error);
                });
            });
        }).catch(() => {
        return res.status(400).send();
    })
});

exports.sendEmailToStudentOfUniversityAndField = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const recipientsGroupsAndCategories = req.body.recipientsGroupsAndCategories;
    console.log(req.body);
    const groups = Object.keys(recipientsGroupsAndCategories);

    console.log(groups)
    let recipients = new Set();

    const emailsToRemove = ["christine.kaiser@hr.ethz.ch", "ekappel@gmx.ch,", "franziska.liese@hr.ethz.ch", "anja.pauling@hr.ethz.ch", "lorena.coletti@hr.ethz.ch",
        "john.imonopi@lernende.ethz.ch", "michael.grunder@hr.ethz.ch", "daniela.gunz@uzh.ch", "roger.gfroerer@careerservices.uzh.ch"]

    let snapshot = await admin.firestore().collection("userData").where("groupIds", "array-contains-any", groups).get();
    console.log(snapshot.size)
    snapshot.forEach(doc => {
        let student = doc.data()
        groups.forEach(group => {
            let registeredGroup = student.registeredGroups.find(registeredGroup => registeredGroup.groupId === group)
            if (registeredGroup) {
                let categoryId = recipientsGroupsAndCategories[group].categoryId;
                let selectedOptions = recipientsGroupsAndCategories[group].selectedOptions;
                let registeredCategory = registeredGroup.categories.find(category => category.id === categoryId);
                if (selectedOptions.includes(registeredCategory.selectedValueId) && !emailsToRemove.includes(student.userEmail) && !student.unsubscribed) {
                    recipients.add(student.userEmail);
                }
            }
        })
    })
    console.log(recipients.size)
    let testEmails = ["maximilian@careerfairy.io"]
    recipients.forEach(recipient => {
        const email = {
            "TemplateId": 22068118,
            "From": 'CareerFairy <noreply@careerfairy.io>',
            "To": recipient,
            "TemplateModel": {
                userEmail: recipient
            }
        };
        client.sendEmailWithTemplate(email).then(response => {
            console.log(`Successfully sent email to ${recipient}`);
        }, error => {
            console.error(`Error sending email to ${recipient}`, error);
        });
    })
});

exports.scheduleReminderEmailSendTestOnRun = functions.pubsub.schedule('every 45 minutes').timeZone('Europe/Zurich').onRun((context) => {
    let messageSender = mailgun.messages();
    const dateStart = new Date(Date.now() + 1000 * 60 * 60 * 1);
    const dateEnd = new Date(Date.now() + 1000 * 60 * 60 * 1.75);
    admin.firestore().collection("livestreams")
        .where("start", ">=", dateStart)
        .where("start", "<", dateEnd)
        .get().then((querySnapshot) => {
        console.log("querysnapshot size: " + querySnapshot.size);
        querySnapshot.forEach(doc => {
            const livestream = doc.data();
            livestream.id = doc.id;
            console.log("livestream company: " + livestream.company);
            console.log("number of emails: " + livestream.registeredUsers.length);
            var data = generateEmailData(livestream.id, livestream, false);
            messageSender.send(data, (error, body) => {
                console.log("error:" + error);
                console.log("body:" + JSON.stringify(body));
            })
        });
    }).catch((error) => {
        console.log("error: " + error);
    });
});

exports.sendReminderEmailsWhenLivestreamStarts = functions.firestore
    .document('livestreams/{livestreamId}')
    .onUpdate((change, context) => {
        console.log("onUpdate")
        let mailgunSender = mailgun.messages();
        const previousValue = change.before.data();
        const newValue = change.after.data();
        if (newValue.test === false) {
            if (!previousValue.hasStarted && !previousValue.hasSentEmails && newValue.hasStarted === true) {
                console.log("sendEmail")
                admin.firestore().collection("livestreams").doc(context.params.livestreamId).update({hasSentEmails: true}).then(() => {
                    var data = generateEmailData(context.params.livestreamId, newValue, true);
                    console.log(data);
                    mailgunSender.send(data, (error, body) => {
                        console.log("error:" + error);
                        console.log("body:" + JSON.stringify(body));
                    })
                })
            }
        }
    });

exports.assertLivestreamRegistrationWasCompleted = functions.firestore
    .document('livestreams/{livestreamId}/registeredStudents/{studentId}')
    .onCreate((snapshot, context) => {
        console.log(`Documents created in registeredStudents in ${context.params.livestreamId}`);
        if (snapshot.exists) {
            admin.firestore().collection("livestreams").doc(context.params.livestreamId).update({
                registeredUsers: admin.firestore.FieldValue.arrayUnion(context.params.studentId)
            }).then(() => {
                console.log(`Successfully updated registeredUsers in ${context.params.livestreamId}`)
            })
        }
    });


exports.assertLivestreamDeregistrationWasCompleted = functions.firestore
    .document('livestreams/{livestreamId}/registeredStudents/{studentId}')
    .onDelete((snapshot, context) => {
        console.log(`Documents deleted in registeredStudents in ${context.params.livestreamId}`);
        admin.firestore().collection("livestreams").doc(context.params.livestreamId).update({
            registeredUsers: admin.firestore.FieldValue.arrayRemove(context.params.studentId)
        }).then(() => {
            console.log(`Successfully removed user from registeredUsers in ${context.params.livestreamId}`)
        })
    });

function generateEmailData(livestreamId, livestream, startingNow) {
    let recipientEmails = livestream.registeredUsers.join();
    var luxonStartDateTime = DateTime.fromJSDate(livestream.start.toDate(), {zone: 'Europe/Zurich'});
    const mailgunVariables = {
        "company": livestream.company,
        "startTime": formatHour(luxonStartDateTime),
        "streamLink": getStreamLink(livestreamId),
        "german": livestream.language === "DE" ? true : false
    };
    let recipientVariablesObj = {};
    livestream.registeredUsers.forEach(email => {
        recipientVariablesObj[email] = mailgunVariables;
    })
    if (startingNow) {
        return {
            from: "CareerFairy <noreply@careerfairy.io>",
            to: recipientEmails,
            subject: 'NOW: Live Stream with ' + livestream.company + ' ' + getLivestreamTimeInterval(livestream.start),
            template: 'registration-reminder',
            "recipient-variables": JSON.stringify(recipientVariablesObj)
        }
    } else {
        return {
            from: "CareerFairy <noreply@careerfairy.io>",
            to: recipientEmails,
            subject: 'Reminder: Live Stream with ' + livestream.company + ' ' + getLivestreamTimeInterval(livestream.start),
            template: 'registration-reminder',
            "recipient-variables": JSON.stringify(recipientVariablesObj),
            "o:deliverytime": luxonStartDateTime.minus({minutes: 45}).toRFC2822()
        }
    }
}

function getStreamLink(streamId) {
    return 'https://www.careerfairy.io/upcoming-livestream/' + streamId;
}

function formatHour(LuxonTime) {
    return LuxonTime.hour + ':' + (LuxonTime.minute < 10 ? ('0' + LuxonTime.minute) : LuxonTime.minute);
}

function getLivestreamTimeInterval(livestreamStartDateTime) {
    var startDateTime = DateTime.fromJSDate(livestreamStartDateTime.toDate(), {zone: 'Europe/Zurich'});
    return '(' + formatHour(startDateTime) + ')';
}

// Run this function every hour
exports.exportFirestoreBackup = functions.pubsub.schedule('every 1 hours').timeZone('Europe/Zurich').onRun((context) => {
    const firestore = require('@google-cloud/firestore');
    const client = new firestore.v1.FirestoreAdminClient();

    const dateNow = new Date(Date.now());
    const bucket = `gs://careerfairy-backup/${dateNow.toDateString()}-${dateNow.toTimeString()}`;

    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName =
        client.databasePath(projectId, '(default)');

    return client.exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        collectionIds: []
    })
        .then(responses => {
            const response = responses[0];
            console.log(`Operation Name: ${response['name']}`);
        })
        .catch(err => {
            console.error(err);
            throw new Error('Export operation failed');
        });
});

exports.scheduleTestLivestreamDeletion = functions.pubsub.schedule('every sunday 09:00').timeZone('Europe/Zurich').onRun((context) => {
    admin.firestore().collection("livestreams")
        .where("test", "==", true)
        .get().then((querySnapshot) => {
        console.log("querysnapshot size: " + querySnapshot.size);
        querySnapshot.forEach(doc => {
            admin.firestore().collection("livestreams").doc(doc.id).delete().catch((e) => {
                console.log(e)
            });
        })
    });
});