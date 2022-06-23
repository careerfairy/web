const functions = require("firebase-functions")
const {
   RtcTokenBuilder,
   RtmTokenBuilder,
   RtcRole,
} = require("agora-access-token")

const { admin } = require("./api/firestoreAdmin")

const appID = "53675bc6d3884026a72ecb1de3d19eb1"
const appCertificate = "286a21681469490783ab75247de35f37"

exports.fetchAgoraRtcToken = functions.https.onCall(async (data, context) => {
   const { isStreamer, uid, sentToken, channelName, streamDocumentPath } = data
   const rtcRole = isStreamer ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER
   const expirationTimeInSeconds = 21600
   const currentTimestamp = Math.floor(Date.now() / 1000)
   const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

   // Build token with uid
   if (rtcRole === RtcRole.PUBLISHER) {
      let livestreamDoc = await admin.firestore().doc(streamDocumentPath).get()
      let livestream = livestreamDoc.data()

      if (!livestream.test) {
         let storedTokenDoc = await admin
            .firestore()
            .doc(streamDocumentPath)
            .collection("tokens")
            .doc("secureToken")
            .get()
         let storedToken = storedTokenDoc.data().value
         console.log("-> storedToken", storedToken)
         console.log("-> sentToken", sentToken)
         if (storedToken !== sentToken) {
            return { status: 400, message: "Invalid token" }
         }
      }
      const rtcToken = RtcTokenBuilder.buildTokenWithUid(
         appID,
         appCertificate,
         channelName,
         uid,
         rtcRole,
         privilegeExpiredTs
      )
      return {
         status: 200,
         token: { rtcToken: rtcToken },
      }
   } else {
      const rtcToken = RtcTokenBuilder.buildTokenWithUid(
         appID,
         appCertificate,
         channelName,
         uid,
         rtcRole,
         privilegeExpiredTs
      )
      return {
         status: 200,
         token: { rtcToken: rtcToken },
      }
   }
})

exports.fetchAgoraRtmToken = functions.https.onCall(async (data, context) => {
   const { uid } = data
   const rtmRole = 0
   const expirationTimeInSeconds = 21600
   const currentTimestamp = Math.floor(Date.now() / 1000)
   const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

   /**
    * uid can't exceed 64 characters, so watch out!
    * https://docs.agora.io/en/Real-time-Messaging/API%20Reference/RTM_cpp/classagora_1_1rtm_1_1_i_rtm_service.html#a2433a0babbed76ab87084d131227346b
    */
   const rtmToken = RtmTokenBuilder.buildToken(
      appID,
      appCertificate,
      uid,
      rtmRole,
      privilegeExpiredTs
   )

   return {
      status: 200,
      token: { rtmToken: rtmToken },
   }
})
