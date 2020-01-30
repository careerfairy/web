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
const next = require('next');
const path = require('path');
const routes = require('./routes');

const dev = false;
const app = next({dev, conf: { distDir: "dist/client" }});
const handler = routes.getRequestHandler(app);


exports.next = functions.https.onRequest(async (req, res) => {
    console.log('File: ' + req.originalUrl); // log the page.js file that is being requested
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

const fs = require('fs');
const https = require('https');
const axios = require('axios');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Mailgun Setup
const mailgun = require("mailgun-js");
const DOMAIN = 'mg.careerfairy.io';
const api_key = '13db35c5779d693ddad243d21e9d5cba-e566273b-b2967fc4';
const host = 'api.eu.mailgun.net';
const mg = mailgun({apiKey: api_key, domain: DOMAIN, host: host});

exports.sendSharePollEmail = functions.https.onRequest(async (req, res) => {

    const html_email = fs.readFileSync(path.resolve(__dirname, './html_emails/JoinUsEmail.html'), 'utf8')
    const sender_email = req.body.senderEmail;
    const recipient_email = req.body.recipientEmail;

    const data = {
        from: 'CareerFairy <noreply@mg.careerfairy.io>',
        to: recipient_email,
        subject: 'You\'ve been invited to join CareerFairy! ',
        text: 'Welcome to CareerFairy!',
        html: html_email.replace("EMAIL_ADDRESS", sender_email)
    };

    mg.messages().send(data, (error, body) => {
        if (error) {
            res.send('Error: ' + error);
        }
        res.send(200);
    });
  });

exports.sendShareLivestreamEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', 'https://careerfairy.io');
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

res.set('Access-Control-Allow-Origin', 'https://careerfairy.io');
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