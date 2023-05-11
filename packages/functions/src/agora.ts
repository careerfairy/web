import { RtcRole, RtcTokenBuilder, RtmTokenBuilder } from "agora-access-token"
import functions = require("firebase-functions")
import { agoraCredentials } from "./api/agora"
import { admin } from "./api/firestoreAdmin"
import config from "./config"

export const fetchAgoraRtcToken = functions
   .region(config.region)
   .https.onCall(async (data) => {
      const { isStreamer, uid, sentToken, channelName, streamDocumentPath } =
         data
      const rtcRole = isStreamer ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER
      const expirationTimeInSeconds = 21600
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

      // Build token with uid
      if (rtcRole === RtcRole.PUBLISHER) {
         const livestreamDoc = await admin
            .firestore()
            .doc(streamDocumentPath)
            .get()
         const livestream = livestreamDoc.data()

         if (!livestream.test) {
            const storedTokenDoc = await admin
               .firestore()
               .doc(streamDocumentPath)
               .collection("tokens")
               .doc("secureToken")
               .get()
            const storedToken = storedTokenDoc.data().value
            console.log("-> storedToken", storedToken)
            console.log("-> sentToken", sentToken)
            if (storedToken !== sentToken) {
               return { status: 400, message: "Invalid token" }
            }
         }
         const rtcToken = RtcTokenBuilder.buildTokenWithUid(
            agoraCredentials.appID,
            agoraCredentials.appCertificate,
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
            agoraCredentials.appID,
            agoraCredentials.appCertificate,
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

export const fetchAgoraRtmToken = functions
   .region(config.region)
   .https.onCall(async (data) => {
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
         agoraCredentials.appID,
         agoraCredentials.appCertificate,
         uid,
         rtmRole,
         privilegeExpiredTs
      )

      return {
         status: 200,
         token: { rtmToken: rtmToken },
      }
   })
