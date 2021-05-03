const functions = require('firebase-functions');
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')

const {setHeaders} = require("./util");
const {axios} = require('./api/axios')
const {admin} = require('./api/firestoreAdmin')


const appID = '53675bc6d3884026a72ecb1de3d19eb1';
const appCertificate = '286a21681469490783ab75247de35f37';

exports.generateAgoraToken = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const channelName = req.body.channel;
    const streamerToken = req.body.token;
    const rtcRole = req.body.isStreamer ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const rtmRole = 0;
    const expirationTimeInSeconds = 21600
    const uid = req.body.uid;
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

    // Build token with uid

    const rtcToken = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, rtcRole, privilegeExpiredTs);
    functions.logger.info("Token With Integer Number Uid: " + rtcToken)
    console.log("Token With Integer Number Uid: " + rtcToken);

    const rtmToken = RtmTokenBuilder.buildToken(appID, appCertificate, uid, rtmRole, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + rtmToken);
    functions.logger.info("Token With Integer Number Uid: " + rtmToken);

    return res.status(200).send({rtcToken: rtcToken, rtmToken: rtmToken});
})

exports.startRecordingLivestream = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const customerKey = "fd45e86c6ffe445ebb87571344e945b1";
    const customerSecret = "3e56ecf0a5ef4eaaa5d26cf8543952d0";

    let plainCredentials = `${customerKey}:${customerSecret}`;
    let base64Credentials = Buffer.from(plainCredentials).toString('base64');

    let authorizationHeader = `Basic ${base64Credentials}`;

    let acquire = await axios({
        method: 'post',
        data: {
            "cname": "bnruMEB6DGte14VNaZ9M",
            "uid": 1234232,
            "clientRequest": {}
        },
        url: `https://api.agora.io/dev/v1/apps/${appID}/cloud_recording/acquire`,
        headers: {
            'Authorization': authorizationHeader,
            'Content-Type': 'application/json'
        }
    })

    console.log(acquire);
    functions.logger.info("acquire", acquire)
});

exports.generateAgoraTokenSecure = functions.https.onRequest(async (req, res) => {

    setHeaders(req, res)

    const channelName = req.body.channel;
    const sentToken = req.body.token;
    const rtcRole = req.body.isStreamer ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const rtmRole = 0;
    const expirationTimeInSeconds = 21600
    const uid = req.body.uid;
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    // Build token with uid
    if (rtcRole === RtcRole.PUBLISHER) {
        let livestreamDoc = await admin.firestore().collection('/livestreams/FekQ2hHMxI2O8LMB54Lx/breakoutRooms').doc(channelName).get();
        let livestream = livestreamDoc.data();
        console.log("-> livestream", livestream);

        if (!livestream.test) {
            let storedTokenDoc = await admin.firestore().collection('livestreams').doc(channelName).collection('tokens').doc('secureToken').get();
            let storedToken = storedTokenDoc.data().value;
            if (storedToken !== sentToken) {
                return res.status(401).send();
            }
        }
        const rtcToken = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, rtcRole, privilegeExpiredTs);
        const rtmToken = RtmTokenBuilder.buildToken(appID, appCertificate, uid, rtmRole, privilegeExpiredTs);
        return res.status(200).send({rtcToken: rtcToken, rtmToken: rtmToken});
    } else {
        const rtcToken = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, rtcRole, privilegeExpiredTs);
        const rtmToken = RtmTokenBuilder.buildToken(appID, appCertificate, uid, rtmRole, privilegeExpiredTs);

        return res.status(200).send({rtcToken: rtcToken, rtmToken: rtmToken});
    }
})
