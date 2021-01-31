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

const algoliasearch = require('algoliasearch');
const dotenv = require('dotenv');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
var serviceAccount = require('./keys/admin.json');

// load values from the .env file in this directory into process.env
dotenv.config();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_API_KEY
const ALGOLIA_GROUP_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME
const ALGOLIA_STREAM_INDEX_NAME = process.env.ALGOLIA_STREAM_INDEX_NAME


// configure algolia
const algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const groupIndex = algolia.initIndex(ALGOLIA_GROUP_INDEX_NAME);
const streamIndex = algolia.initIndex(ALGOLIA_STREAM_INDEX_NAME);


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const routes = require('./routes');

var api_key = '13db35c5779d693ddad243d21e9d5cba-e566273b-b2967fc4';
var domain = 'mail.careerfairy.io';
var host = 'api.eu.mailgun.net';

const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain, host: host});
var {DateTime} = require('luxon');

exports.next = functions.https.onRequest(async (req, res) => {
    const next = require('next');

    const app = next({conf: {distDir: "dist/client"}});
    const handler = routes.getRequestHandler(app);
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

exports.next2 = functions.https.onRequest(async (req, res) => {
    const next = require('next');

    const app = next({conf: {distDir: "dist/client"}});
    const handler = routes.getRequestHandler(app);
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

exports.next3 = functions.https.onRequest(async (req, res) => {
    const next = require('next');

    const app = next({conf: {distDir: "dist/client"}});
    const handler = routes.getRequestHandler(app);
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

// Cloud Trigger functions

exports.addToIndex = functions.firestore.document('careerCenterData/{careerCenter}')
    .onCreate(snapshot => {
        const data = snapshot.data();
        const objectID = snapshot.id
        data.groupId = objectID
        // deletes personal Identifiable data
        delete data.adminEmail
        return groupIndex.saveObject({...data, objectID})
            .then(() => {
                functions.logger.log('Groups imported into Algolia');
            })
            .catch(error => {
                functions.logger.warn('Error when importing group into Algolia', error);
            });

    })

exports.addToStreamIndex = functions.firestore.document('livestreams/{livestream}')
    .onCreate(snapshot => {
        const data = snapshot.data();
        if (data.test === false) { // dont add test streams to algolia
            const objectID = snapshot.id
            data.numberOfRegistered = data.registeredUsers?.length || 0

            // deletes personal Identifiable data
            delete data.registeredUsers
            return streamIndex.saveObject({...data, objectID})
                .then(() => {
                    functions.logger.log('Stream imported into Algolia');
                })
                .catch(error => {
                    functions.logger.warn('Error when importing stream into Algolia', error);
                });
        }
    })

exports.updateIndex = functions.firestore.document('careerCenterData/{careerCenter}')
    .onUpdate(change => {
        const newData = change.after.data();
        // deletes personal Identifiable data
        delete newData.adminEmail

        const objectID = change.after.id;
        return groupIndex.saveObject({...newData, objectID})
            .then(() => {
                functions.logger.log('Groups updated into Algolia');
            })
            .catch(error => {
                functions.logger.warn('Error when importing group into Algolia', error);
            })
    })

exports.updateStreamIndex = functions.firestore.document('livestreams/{livestream}')
    .onUpdate(change => {
        const newData = change.after.data();
        if (newData.test === false) { // dont add test streams to algolia

            newData.numberOfRegistered = newData.registeredUsers?.length || 0
            // deletes personal Identifiable data
            delete newData.registeredUsers

            const objectID = change.after.id;
            return streamIndex.saveObject({...newData, objectID})
                .then(() => {
                    functions.logger.log('Stream updated into Algolia');
                })
                .catch(error => {
                    functions.logger.warn('Error when importing stream into Algolia', error);
                })

        }
    })

exports.deleteFromIndex = functions.firestore.document('careerCenterData/{careerCenter}')
    .onDelete(snapshot => groupIndex.deleteObject(snapshot.id))

exports.deleteStreamFromIndex = functions.firestore.document('livestreams/{livestream}')
    .onDelete(snapshot => streamIndex.deleteObject(snapshot.id))


// Http functions

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
                "TemplateModel": {verification_link: link}
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

    await admin.firestore().collection("userData").doc(recipient_email).set({validationPin: pinCode});

    const email = {
        "TemplateId": 17669843,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": recipient_email,
        "TemplateModel": {pinCode: pinCode}
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

    await admin.firestore().collection("userData").doc(recipient_email).update({validationPin: pinCode});

    const email = {
        "TemplateId": 17669843,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": recipient_email,
        "TemplateModel": {pinCode: pinCode}
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
        "TemplateModel": {pinCode: pinCode}
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
        "TemplateModel": {pinCode: pinCode}
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

    admin.firestore().collection("userData").doc(recipient_email).get().then(querySnapshot => {
        if (!querySnapshot.isEmpty) {
            let user = querySnapshot.data();
            if (user.validationPin === pinCode) {
                admin.auth().getUserByEmail(recipient_email).then(userRecord => {
                    admin.auth().updateUser(userRecord.uid, {
                        emailVerified: true
                    }).then(userRecord => {
                        console.log(userRecord);
                        res.sendStatus(200);
                    })
                })
            } else {
                res.sendStatus(403);
            }
        }
    }).catch(error => {
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
                "TemplateModel": {action_url: link}
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
        .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully updated user', userRecord.toJSON());
        })
        .catch(function (error) {
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
    const recipient_university = req.body.universityCode;
    const recipient_university_country_code = req.body.universityCountryCode;
    const pinCode = getRandomInt(9999);

    admin.firestore().collection("userData").doc(recipient_email).set(
        {
            id: recipient_email,
            validationPin: pinCode,
            firstName: recipient_first_name,
            lastName: recipient_last_name,
            userEmail: recipient_email,
            universityCode: recipient_university,
            universityCountryCode: recipient_university_country_code,
        }).then(() => {
        const email = {
            "TemplateId": 17669843,
            "From": 'CareerFairy <noreply@careerfairy.io>',
            "To": recipient_email,
            "TemplateModel": {pinCode: pinCode}
        };

        return client.sendEmailWithTemplate(email).then(response => {
            console.log(`Successfully sent PIN email to ${recipient_email}`);
            res.sendStatus(200);
        }, error => {
            console.error(`Error sending PIN email to ${recipient_email}`, error);
            res.sendStatus(500);
        });
    }).catch((error) => {
        console.error(`Error creating user ${recipient_email}`, error);
        res.sendStatus(500);
    });
});

exports.sendPostmarkEmailUserDataAndUniWithName = functions.https.onRequest(async (req, res) => {

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
    const recipient_university = req.body.universityCode;
    const recipient_university_name = req.body.universityName;
    const recipient_university_country_code = req.body.universityCountryCode;
    const pinCode = getRandomInt(9999);

    admin.firestore().collection("userData").doc(recipient_email).set(
        {
            id: recipient_email,
            validationPin: pinCode,
            firstName: recipient_first_name,
            lastName: recipient_last_name,
            userEmail: recipient_email,
            universityCode: recipient_university,
            universityName: recipient_university_name,
            universityCountryCode: recipient_university_country_code,
        }).then(() => {
        const email = {
            "TemplateId": 17669843,
            "From": 'CareerFairy <noreply@careerfairy.io>',
            "To": recipient_email,
            "TemplateModel": {pinCode: pinCode}
        };

        return client.sendEmailWithTemplate(email).then(response => {
            console.log(`Successfully sent PIN email to ${recipient_email}`);
            res.sendStatus(200);
        }, error => {
            console.error(`Error sending PIN email to ${recipient_email}`, error);
            res.sendStatus(500);
        });
    }).catch((error) => {
        console.error(`Error creating user ${recipient_email}`, error);
        res.sendStatus(500);
    });
});


const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')
const appID = '53675bc6d3884026a72ecb1de3d19eb1';
const appCertificate = '286a21681469490783ab75247de35f37';

exports.generateAgoraToken = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    const channelName = req.body.channel;
    const rtcRole = req.body.isStreamer ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const rtmRole = 0;
    const expirationTimeInSeconds = 5400
    const uid = req.body.uid;
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    
    // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.
    
    // Build token with uid
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, rtcRole, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + rtcToken);
    const rtmToken = RtmTokenBuilder.buildToken(appID, appCertificate, uid, rtmRole, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + rtmToken);

    return res.status(200).send({ rtcToken: rtcToken, rtmToken: rtmToken });
    
})


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
    let snapshot = await admin.firestore().collection("userData").where("groupIds", "array-contains-any", groups).get();
    console.log(snapshot.size)
    snapshot.forEach( doc => {
        let student = doc.data()
        groups.forEach( group => {
            let registeredGroup = student.registeredGroups.find( registeredGroup => registeredGroup.groupId === group)
            if (registeredGroup) {
                let categoryId = recipientsGroupsAndCategories[group].categoryId;
                let selectedOptions = recipientsGroupsAndCategories[group].selectedOptions;
                let registeredCategory = registeredGroup.categories.find( category => category.id === categoryId);
                if (selectedOptions.includes(registeredCategory.selectedValueId)) {
                    recipients.add(student.userEmail);
                }
            }
        })
        // recipients.forEach( recipient => {
        //     const email = {
        //         "TemplateId": XXXXXXX,
        //         "From": 'CareerFairy <noreply@careerfairy.io>',
        //         "To": recipient,
        //         "TemplateModel": {}
        //     };
        //     client.sendEmailWithTemplate(email).then(response => {
        //         console.log(`Successfully sent email to ${recipient_email}`);
        //         res.sendStatus(200);
        //     }, error => {
        //         console.error(`Error sending email to ${recipient_email}`, error);
        //         res.sendStatus(500);
        //     });
        // })
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
        data: JSON.stringify({'format': 'urls'}),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
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
        url: 'https://streaming.careerfairy.io/WebRTCAppEE/rest/v2/broadcasts/' + req.query.livestreamId,
    }).then(response => {
        console.log(response.data);
        return res.status(200).send(response.data);
    }).catch(error => {
        console.log(error);
    });
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
    var endDateTime = DateTime.fromJSDate(livestreamStartDateTime.toDate(), {zone: 'Europe/Zurich'}).plus({minutes: 30});
    return '(' + formatHour(startDateTime) + '-' + formatHour(endDateTime) + ')';
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