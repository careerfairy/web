const functions = require('firebase-functions')

const {axios} = require('./api/axios')
const {admin} = require('./api/firestoreAdmin')
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')

exports.startRecordingLivestream = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    }

    const appID = '53675bc6d3884026a72ecb1de3d19eb1';
    const appCertificate = '286a21681469490783ab75247de35f37';

    const customerKey = "fd45e86c6ffe445ebb87571344e945b1";
    const customerSecret = "3e56ecf0a5ef4eaaa5d26cf8543952d0";

    const awsSecretKey = "tenlla/MPorZigMkl+wa7OGoxe63MuVYn7lgwrhW";
    const awsAccessKey = "AKIAIUSA7ZDE4TYSY3RA";

    let plainCredentials = `${customerKey}:${customerSecret}`;
    let base64Credentials = Buffer.from(plainCredentials).toString('base64');

    let authorizationHeader = `Basic ${base64Credentials}`;
    let streamId = req.body.streamId
    let token = req.body.token

    let acquire = null;
    try {
        acquire = await axios({
            method: 'post',
            data: {
                "cname": streamId,
                "uid": "1234232",
                "clientRequest":{
                    "resourceExpiredHour": 24,
                    "scene": 1
                 }
            },
            url: `https://api.agora.io/v1/apps/${appID}/cloud_recording/acquire`,
            headers: {
                'Authorization': authorizationHeader,
                'Content-Type': 'application/json'
            }
        })
    } catch (e) {
        console.log("Massive error", e);
        return res.status(400).send()
    }
    

    console.log("We got this far");

    let resourceId = acquire.data.resourceId;
    const expirationTimeInSeconds = 21600
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, streamId, "1234232", RtcRole.SUBSCRIBER, privilegeExpiredTs);

    let start = null;

    let storedTokenDoc = await admin.firestore().collection('livestreams')
        .doc(streamId)
        .collection('tokens')
        .doc('secureToken')
        .get();

    let storedToken = storedTokenDoc.data().value
    if (storedToken !== token) {
        return res.status(400).send()
    }

    try{
        start = await axios({
            method: 'post',
            data: {
                "cname": streamId,
                "uid": "1234232",
                "clientRequest": {
                    "token": rtcToken,
                    "extensionServiceConfig": {
                        "errorHandlePolicy": "error_abort",
                        "extensionServices":[{
                                "serviceName":"web_recorder_service",
                                "errorHandlePolicy": "error_abort",
                                "serviceParam": {
                                    "url": `https://careerfairy.io/streaming/${streamId}/viewer?token=${token}`,
                                    "audioProfile": 0,
                                    "videoWidth": 1280,
                                    "videoHeight": 720,
                                    "maxRecordingHour": 72
                            }
                        }]
                    },
                    "recordingFileConfig":{
                        "avFileType":[
                            "hls",
                            "mp4"
                        ]
                    },
                    "storageConfig":{
                        "vendor": 1,
                        "region": 7,
                        "bucket":"agora-cf-cloud-recordings",
                        "accessKey": awsAccessKey,
                        "secretKey": awsSecretKey,
                        "fileNamePrefix":[
                            "directory1",
                            "directory2"
                        ]
                    }
                }
            },
            url: `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resourceId}/mode/web/start`,
            headers: {
                'Authorization': authorizationHeader,
                'Content-Type': 'application/json'
            }
        })
    } catch (e) {
        return res.status(400).send()
        console.log("Error", e.response)
    }

    let startResponse = start.data;

    console.log(startResponse);

    let sid = startResponse.sid;

    await admin.firestore().collection('livestreams')
        .doc(streamId)
        .collection('recordingToken')
        .doc('token')
        .set({
            sid: sid,
            resourceId: resourceId
        })
});

exports.stopRecordingLivestream = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    }

    const appID = '53675bc6d3884026a72ecb1de3d19eb1';

    const customerKey = "fd45e86c6ffe445ebb87571344e945b1";
    const customerSecret = "3e56ecf0a5ef4eaaa5d26cf8543952d0";

    let plainCredentials = `${customerKey}:${customerSecret}`;
    let base64Credentials = Buffer.from(plainCredentials).toString('base64');

    let authorizationHeader = `Basic ${base64Credentials}`;
    let streamId = req.body.streamId
    let token = req.body.token

    let storedTokenDoc = await admin.firestore().collection('livestreams')
        .doc(streamId)
        .collection('tokens')
        .doc('secureToken')
        .get();

    let storedToken = storedTokenDoc.data().value
    if (storedToken !== token) {
        return res.status(400).send()
    }

    let recordingToken = await admin.firestore().collection('livestreams')
        .doc(streamId)
        .collection('recordingToken')
        .doc('token')
        .get();
    let { resourceId, sid } = recordingToken.data();

    console.log(resourceId, sid)

    axios({
        method: 'post',
        data: {
            "cname": streamId,
            "uid": "1234232",
            "clientRequest":{}
        },
        url: `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/web/stop`,
        headers: {
            'Authorization': authorizationHeader,
            'Content-Type': 'application/json'
        }
    }).then((response) => { console.log(response) }).catch( error => console.log("Error in stop", error));
});

