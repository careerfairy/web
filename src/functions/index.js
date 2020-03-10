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
admin.initializeApp();

const path = require('path');
const routes = require('./routes');

const dev = false;


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

exports.sendReminderEmailsToRegistrants = functions.https.onRequest(async (req, res) => {

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
        "TemplateId": 16660117,
        "From": 'CareerFairy <noreply@careerfairy.io>',
        "To": req.body.recipientEmail,
        "TemplateModel": { 
            
        }
    };

    client.sendEmailWithTemplate(email).then(response => {
        return res.send(200);
    }, error => {
        console.log('error:' + error);
        return res.status(400).send(error);
    });
});

exports.sendEmailsToRegistrants = functions.https.onRequest(async (req, res) => {

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
                    "TemplateId": 16660117,
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

    // your JSON object.
    let o = {};
    
    let bodyString = JSON.stringify(o);
    let options = {
        host: "global.xirsys.net",
        path: "/_turn/CareerFairy",
        method: "PUT",
        headers: {
        "Authorization": "Basic " + Buffer.from("mvoss:a1319174-e353-11e9-b4f0-0242ac110003").toString("base64"),
        "Content-Type":"application/json",
        "Content-Length": bodyString.length
        }
    };

    let httpreq = https.request(options, httpres => {
        let str = "";
        httpres.on("data", chunk =>  {
            str += chunk.toString('utf8');
        });
        httpres.on("error", error => { 
            console.log("error: ",e); 
        });
        httpres.on("end", () => { 
            console.log("string: ", str);
            res.status(200).send(str);
        });
    });
      
    httpreq.on("error", error => console.log("request error: ",error));
    httpreq.end(bodyString);
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