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

    console.log("link: " + redirect_link);

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

const fs = require('fs');
const https = require('https');
const axios = require('axios');

const mailgun = require("mailgun-js");
const DOMAIN = 'mail.careerfairy.io';
const api_key = '13db35c5779d693ddad243d21e9d5cba-e566273b-b2967fc4';
const host = 'api.eu.mailgun.net';
const mg = mailgun({apiKey: api_key, domain: DOMAIN, host: host});

exports.sendEmailVerificationEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    }

    const html_email = fs.readFileSync(path.resolve(__dirname, './html_emails/EmailVerificationEmail.html'), 'utf8')
    const recipient_email = req.body.recipientEmail;
    const redirect_link = req.body.redirect_link;

    const actionCodeSettings = {
        url: redirect_link
    };

    admin.auth().generateEmailVerificationLink(recipient_email, actionCodeSettings)
        .then((link) => {
            const data = {
                from: 'CareerFairy <noreply@mail.careerfairy.io>',
                to: recipient_email,
                subject: 'CareerFairy Email Verification',
                text: 'Welcome to CareerFairy!',
                html: html_email.replace("__LINK__", link)
            };
            return mg.messages().send(data, (error, body) => {
                if (error) {
                    res.send('Error: ' + error);
                }
                res.send(200);
            });
        })
        .catch((error) => {
            console.log(error);
        });
});

exports.sendResetPasswordEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    }

    const html_email = fs.readFileSync(path.resolve(__dirname, './html_emails/ResetPasswordEmail.html'), 'utf8')
    const recipient_email = req.body.recipientEmail;
    const redirect_link = req.body.redirect_link;

    console.log("link: " + redirect_link);

    const actionCodeSettings = {
        url: redirect_link
    };

    admin.auth().generatePasswordResetLink(recipient_email, actionCodeSettings)
        .then((link) => {
            const data = {
                from: 'CareerFairy <noreply@mail.careerfairy.io>',
                to: recipient_email,
                subject: 'CareerFairy Password Reset',
                text: 'Let us reset your password',
                html: html_email.replace("__LINK__", link)
            };
            return mg.messages().send(data, (error, body) => {
                if (error) {
                    res.send('Error: ' + error);
                }
                res.send(200);
            });
        })
        .catch((error) => {
            console.log(error);
        });
});

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

exports.sendEmailVerificationEmail = functions.https.onRequest(async (req, res) => {

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
 
    const data = {
        from: 'CareerFairy <noreply@mail.careerfairy.io>',
        to: recipient_email,
        subject: 'CareerFairy Email Verification',
        text: 'Welcome to CareerFairy!',
        html: html_email.replace("__LINK__", link)
    };
    return mg.messages().send(data, (error, body) => {
        if (error) {
            res.send('Error: ' + error);
        }
        res.send(200);
    });
});

exports.sendShareLivestreamEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', 'careerfairy.io');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } 

    const html_email = fs.readFileSync(path.resolve(__dirname, './html_emails/ShareLivestreamEmail.html'), 'utf8')

    const data = {
        from: 'CareerFairy <noreply@mg.careerfairy.io>',
        to: req.body.recipientEmail,
        subject: 'Don\'t miss ' + req.body.companyName + '\'s next Livestream!',
        text: 'Don\'t miss ' + req.body.companyName + '\'s next Livestream!',
        html: html_email.replace("COMPANY_NAME", req.body.companyName)
                        .replace("LIVESTREAM_TITLE", req.body.livestreamTitle)
                        .replace("LIVESTREAM_ID", req.body.livestreamId)
    };

    mg.messages().send(data, (error, body) => {
        if (error) {
            res.send('Error: ' + error);
        }
        res.status(200).send("The email was successfully sent");
    });
});


exports.sendShareLivestreamPollEmail = functions.https.onRequest(async (req, res) => {

res.set('Access-Control-Allow-Origin', 'careerfairy.io');
res.set('Access-Control-Allow-Credentials', 'true');

if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
} 

const html_email = fs.readFileSync(path.resolve(__dirname, './html_emails/ShareLivestreamPollEmail.html'), 'utf8')

const data = {
    from: 'CareerFairy <noreply@mg.careerfairy.io>',
    to: req.body.recipientEmail,
    subject: 'Decide the topic of ' + req.body.companyName + '\'s next Livestream!',
    text: 'Welcome to CareerFairy!',
    html: html_email.replace("COMPANY_NAME", req.body.companyName)
                    .replace("LIVESTREAM_ID", req.body.livestreamId)
};

mg.messages().send(data, (error, body) => {
    if (error) {
        res.send('Error: ' + error);
    }
    res.status(200).send("The email was successfully sent");
});
});

exports.getXirsysNtsToken = functions.https.onRequest(async (req, res) => {

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

    res.set('Access-Control-Allow-Origin', 'https://careerfairy.io');
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

exports.getLivestreamStatistics = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', 'localhost');
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