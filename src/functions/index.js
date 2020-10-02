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

const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require('./keys/admin.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const routes = require('./routes');

var api_key = '13db35c5779d693ddad243d21e9d5cba-e566273b-b2967fc4';
var domain = 'mail.careerfairy.io';
var host = 'api.eu.mailgun.net';

const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain, host: host});
var { DateTime } = require('luxon');

exports.next = functions.https.onRequest(async (req, res) => {
    const next = require('next');

    const app = next({conf: { distDir: "dist/client" }});
    const handler = routes.getRequestHandler(app);
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

exports.next2 = functions.https.onRequest(async (req, res) => {
    const next = require('next');

    const app = next({conf: { distDir: "dist/client" }});
    const handler = routes.getRequestHandler(app);
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

exports.next3 = functions.https.onRequest(async (req, res) => {
    const next = require('next');

    const app = next({conf: { distDir: "dist/client" }});
    const handler = routes.getRequestHandler(app);
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

const postmark = require("postmark");
var serverToken = "3f6d5713-5461-4453-adfd-71f5fdad4e63";
var client = new postmark.ServerClient(serverToken);

exports.sendPostmarkEmailVerificationEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    }

    const recipient_email = req.body.recipientEmail;
    const redirect_link = req.body.redirect_link;

    const actionCodeSettings = {
        url: redirect_link
    };

    admin.auth().generateEmailVerificationLink(recipient_email, actionCodeSettings)
        .then((link) => {
            const email = {
                "TemplateId": 16531011,
                "From": 'CareerFairy <noreply@careerfairy.io>',
                "To": recipient_email,
                "TemplateModel": { verification_link: link }
            };
            return client.sendEmailWithTemplate(email).then(response => {
                res.send(200);
            }, error => {
                res.send('Error: ' + error);
            });
        })
        .catch((error) => {
            console.log(error);
        });
});

exports.sendPostmarkEmailVerificationEmailWithPin = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const recipient_email = req.body.recipientEmail;
    const pinCode = getRandomInt(9999);

    await admin.firestore().collection("userData").doc(recipient_email).set({ validationPin: pinCode });

    const email = {
        "TemplateId": 17669843,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": recipient_email,
        "TemplateModel": { pinCode: pinCode }
    };

    return client.sendEmailWithTemplate(email).then(response => {
        res.sendStatus(200);
    }, error => {
        res.sendStatus(500);
    });
});

exports.resendPostmarkEmailVerificationEmailWithPin = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const recipient_email = req.body.recipientEmail;
    const pinCode = getRandomInt(9999);

    await admin.firestore().collection("userData").doc(recipient_email).update({ validationPin: pinCode });

    const email = {
        "TemplateId": 17669843,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": recipient_email,
        "TemplateModel": { pinCode: pinCode }
    };

    return client.sendEmailWithTemplate(email).then(response => {
        res.sendStatus(200);
    }, error => {
        res.sendStatus(500);
    });
});

exports.sendPostmarkEmailVerificationEmailWithPinAndUpdateUserData = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const recipient_email = req.body.recipientEmail;
    const recipient_first_name = req.body.firstName;
    const recipient_last_name = req.body.lastName;
    const pinCode = getRandomInt(9999);

    await admin.firestore().collection("userData").doc(recipient_email).set(
        {
            id: recipient_email,
            validationPin: pinCode,
            firstName: recipient_first_name,
            lastName: recipient_last_name,
            userEmail: recipient_email,
        });

    const email = {
        "TemplateId": 17669843,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": recipient_email,
        "TemplateModel": { pinCode: pinCode }
    };

    return client.sendEmailWithTemplate(email).then(response => {
        res.sendStatus(200);
    }, error => {
        res.sendStatus(500);
    });
});

exports.sendPostmarkEmailVerificationEmailWithPinAndUpdateUserDataAndUni = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const recipient_email = req.body.recipientEmail;
    const recipient_first_name = req.body.firstName;
    const recipient_last_name = req.body.lastName;
    const recipient_university = req.body.university;
    const recipient_university_country_code = req.body.universityCountryCode;
    const pinCode = getRandomInt(9999);

    await admin.firestore().collection("userData").doc(recipient_email).set(
        {
            id: recipient_email,
            validationPin: pinCode,
            firstName: recipient_first_name,
            lastName: recipient_last_name,
            userEmail: recipient_email,
            university: recipient_university,
            universityCountryCode: recipient_university_country_code,
        });

    const email = {
        "TemplateId": 17669843,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": recipient_email,
        "TemplateModel": { pinCode: pinCode }
    };

    return client.sendEmailWithTemplate(email).then(response => {
        res.sendStatus(200);
    }, error => {
        res.sendStatus(500);
    });
});

function getRandomInt(max) {
    let variable = Math.floor(Math.random() * Math.floor(max));
    if (variable < 1000) {
        return variable + 1000;
    } else {
        return variable;
    }
}

exports.verifyEmailWithPin = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const recipient_email = req.body.recipientEmail;
    const pinCode = req.body.pinCode;

    admin.firestore().collection("userData").doc(recipient_email).get().then( querySnapshot => {
        if (!querySnapshot.isEmpty) {
            let user = querySnapshot.data();
            if (user.validationPin === pinCode) {
                admin.auth().getUserByEmail(recipient_email).then( userRecord => {
                    admin.auth().updateUser(userRecord.uid, {
                        emailVerified: true
                    }).then( userRecord => {
                        console.log(userRecord);
                        res.sendStatus(200);
                    })
                })
            } else {
                res.sendStatus(403);
            }
        }
    }).catch( error => {
        res.sendStatus(500);
    });
});

exports.sendPostmarkResetPasswordEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    }

    const recipient_email = req.body.recipientEmail;
    const redirect_link = req.body.redirect_link;

    const actionCodeSettings = {
        url: redirect_link
    };

    admin.auth().generatePasswordResetLink(recipient_email, actionCodeSettings)
        .then((link) => {
            const email = {
                "TemplateId": 16531013,
                "From": 'CareerFairy <noreply@careerfairy.io>',
                "To": recipient_email,
                "TemplateModel": { action_url: link }
            };
            return client.sendEmailWithTemplate(email).then(response => {
                res.send(200);
            }, error => {
                res.send('Error: ' + error);
            });
        })
    .catch((error) => {
        console.log(error);
    });
});

const axios = require('axios');

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

exports.updateFakeUser = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }
    admin.auth().updateUser(req.body.uid, {
        emailVerified: true
      })
    .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully updated user', userRecord.toJSON());
    })
    .catch(function(error) {
        console.log('Error updating user:', error);
    });
});

exports.sendPostmarkEmailUserDataAndUni = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const recipient_email = req.body.recipientEmail;
    const recipient_first_name = req.body.firstName;
    const recipient_last_name = req.body.lastName;
    const recipient_university = req.body.university;
    const recipient_university_country_code = req.body.universityCountryCode;
    const pinCode = getRandomInt(9999);

    await admin.firestore().collection("userData").doc(recipient_email).set(
        {
            id: recipient_email,
            validationPin: pinCode,
            firstName: recipient_first_name,
            lastName: recipient_last_name,
            userEmail: recipient_email,
            university: recipient_university,
            universityCountryCode: recipient_university_country_code,
        });

    const email = {
        "TemplateId": 17669843,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": recipient_email,
        "TemplateModel": { pinCode: pinCode }
    };

    return client.sendEmailWithTemplate(email).then(response => {
        res.sendStatus(200);
    }, error => {
        res.sendStatus(500);
    });
});

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
            registeredUsers.forEach( userEmail => {
                const email = {
                    "TemplateId": req.body.templateId,
                    "From": 'CareerFairy <noreply@careerfairy.io>',
                    "To": userEmail,
                    "TemplateModel": {       
                    }
                };
                client.sendEmailWithTemplate(email).then(() => {
                    console.log("email sent to: " + userEmail);
                    itemsProcessed++;
                    if(itemsProcessed === registeredUsers.length) {
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

exports.sendReminderEmailToUserFromUniversity = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    let university = req.body.universityId;
    let faculties = req.body.faculties;

    let collectionRef;

    if (faculties && faculties.length > 0) {
        collectionRef = admin.firestore().collection("userData")
        .where("university", "==", university)
        .where("faculty", "in", faculties);
    } else {
        collectionRef = admin.firestore().collection("userData")
        .where("university", "==", university);
    }

    collectionRef.get()
    .then((querySnapshot) => {
        let counter = 0;
        console.log("snapshotSize:" + querySnapshot.size);
        querySnapshot.forEach(doc => {
            var id = doc.id;
            const email = {
                "TemplateId": req.body.templateId,
                "From": 'CareerFairy <noreply@careerfairy.io>',
                "To": id,
                "TemplateModel": {       
                }
            };
            client.sendEmailWithTemplate(email).then(() => {
                counter++;
                console.log("email sent to: " + id);
                if (counter === querySnapshot.size) {
                    return res.status(200).send();
                }
            }, error => {
                console.log('error:' + error);
                return res.status(400).send();
            });
        });
    }).catch(error => {
        console.log('error:' + error);
        return res.status(400).send();
    })
});

exports.sendReminderEmailToViewersFromLivestream = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    let livestreamId = req.body.livestreamId;
    let faculties = req.body.faculties;
    let university = req.body.university;

    console.log("Hello world");
    admin.firestore().collection("livestreams").doc(livestreamId).collection("registeredStudents")
    .where("faculty", "in", faculties).where("university", "==", university).get()
    .then((querySnapshot) => {
        let counter = 0;
        console.log("snapshotSize:" + querySnapshot.size);
        querySnapshot.forEach(doc => {
            var id = doc.id;
            const email = {
                "TemplateId": req.body.templateId,
                "From": 'CareerFairy <noreply@careerfairy.io>',
                "To": id,
                "TemplateModel": {       
                }
            };
            client.sendEmailWithTemplate(email).then(() => {
                counter++;
                console.log("email sent to: " + id);
                if (counter === querySnapshot.size) {
                    return res.status(200).send();
                }
            }, error => {
                console.log('error:' + error);
                return res.status(400).send();
            });
        });
    }).catch(error => {
        console.log('error:' + error);
        return res.status(400).send();
    })
});

exports.sendSpecificEmailsToUsers = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    admin.firestore().collection("userData").get()
        .then((querySnapshot) => {
            let counter = 0;
            console.log("snapshotSize:" + querySnapshot.size);
            querySnapshot.forEach(doc => {
                var id = doc.id;
                const email = {
                    "TemplateId": req.body.templateId,
                    "From": 'CareerFairy <noreply@careerfairy.io>',
                    "To": id,
                    "TemplateModel": {       
                    }
                };
                client.sendEmailWithTemplate(email).then(() => {
                    counter++;
                    console.log("email sent to: " + id);
                    if (counter === querySnapshot.size) {
                        return res.status(200).send();
                    }
                }, error => {
                    console.log('error:' + error);
                    return res.status(400).send();
                });
            });
        }).catch(() => {
            return res.status(400).send();
        })
});

exports.getAuthUsers = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    admin.auth().listUsers()
        .then((userRecords) => {
            var emails = [];
            userRecords.users.forEach(user => {
                emails.push(user.email);
                if (emails.length === userRecords.length) {
                    res.status(200).send(userRecords);
                }
            })
        }).catch(() => {
            return res.status(400).send();
        })
    
});

exports.getXirsysNtsToken = functions.https.onRequest(async (req, res) => {

    const https = require('https');

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', '');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    }

    axios({
        method: 'put',
        url: 'https://mvoss:a1319174-e353-11e9-b4f0-0242ac110003@global.xirsys.net/_turn/CareerFairy',
        data: JSON.stringify({ 'format': 'urls' }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then( response => { 
            console.log(response.data);
            res.status(200).send(response.data);
        }).catch(error => {
            console.log(error);
            res.status(400).send(error);
    });
});

exports.getNumberOfViewers = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', '');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } 

    axios({
        method: 'get',
        url: 'https://thrillin.work/WebRTCAppEE/rest/v2/broadcasts/' + req.query.livestreamId + '/broadcast-statistics',
    }).then( response => { 
            console.log(response.data);
            return res.status(200).send(response.data);
        }).catch(error => {
            console.log(error);
    });
});

exports.scheduleReminderEmailSendTestOnRun = functions.pubsub.schedule('every 2 minutes').timeZone('Europe/Zurich').onRun((context) => {
    const dateNow = new Date(Date.now() + 1000 * 60 * 60 * 2);
    const dateTomorrow =  new Date(Date.now() + 1000 * 60 * 60 * 24);
    admin.firestore().collection("livestreams")
        .where("start", ">=", dateNow)
        .where("start", "<", dateTomorrow)
        .get().then((querySnapshot) => {
            console.log("querysnapshot size: " + querySnapshot.size);
            querySnapshot.forEach(doc => {
                const livestream = doc.data();
                livestream.id = doc.id;
                console.log("livestream company: " + livestream.company);
                console.log("number of emails: " + livestream.registeredUsers.length);
                var data = generateEmailData("mvoss.private@gmail.com", livestream);
                mailgun.messages().send(data, (error, body) => {console.log("error:" + error); console.log("body:" + JSON.stringify(body));})
            });
            console.log("Finishes Logging Emails");
            res.send(200);
        }).catch((error) => {
            console.log("error: " + error);
            return null;
            res.send(400);
        });
});

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

exports.scheduleTestLivestreamDeletion = functions.pubsub.schedule('every 24 hours').timeZone('Europe/Zurich').onRun((context) => {});

function generateEmailData(recipientEmail, livestream) {
    var luxonStartDateTime = DateTime.fromJSDate(livestream.start.toDate(), { zone: 'Europe/Zurich' });
    return {
        //Specify email data
        from: "CareerFairy <noreply@careerfairy.io>",
        to: recipientEmail,
        subject: 'Reminder: TODAY - Live Stream with ' + livestream.company + ' ' + getLivestreamTimeInterval(livestream.start),
        template: 'registration-reminder',
        "h:X-Mailgun-Variables": JSON.stringify({ "company": livestream.company, "startTime": formatHour(luxonStartDateTime), "streamLink": getStreamLink(livestream.id), "german": livestream.language === "DE" ? true : false }),
        "o:deliverytime": luxonStartDateTime.minus({ hours: 2 }).toRFC2822()
    }
}

function getStreamLink(streamId) {
    return 'https://www.careerfairy.io/upcoming-livestream/' + streamId;
}

function formatHour(LuxonTime) {
    return LuxonTime.hour + ':' + (LuxonTime.minute < 10 ? ('0' + LuxonTime.minute) : LuxonTime.minute);
}

function getLivestreamTimeInterval(livestreamStartDateTime) {
    var startDateTime = DateTime.fromJSDate(livestreamStartDateTime.toDate(), { zone: 'Europe/Zurich' });
    var endDateTime = DateTime.fromJSDate(livestreamStartDateTime.toDate(), { zone: 'Europe/Zurich' }).plus({ minutes: 30 });
    return '(' + formatHour(startDateTime) + '-' + formatHour(endDateTime) + ')';
}