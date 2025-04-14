import {
   AgoraRTCTokenRequest,
   AgoraRTMTokenRequest,
} from "@careerfairy/shared-lib/agora/token"
import { RtcRole, RtcTokenBuilder, RtmTokenBuilder } from "agora-token"
import { CallableRequest } from "firebase-functions/lib/common/providers/https"
import { agoraCredentials } from "./api/agora"
import { firestore } from "./api/firestoreAdmin"
import functions = require("firebase-functions")

export const fetchAgoraRtcToken = functions.https.onCall(
   async (request: CallableRequest<AgoraRTCTokenRequest>) => {
      const { isStreamer, uid, sentToken, channelName, streamDocumentPath } =
         request.data
      const rtcRole = isStreamer ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER

      const expirationTimeInSeconds = 21600
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

      // Build token with uid
      if (rtcRole === RtcRole.PUBLISHER) {
         const livestreamDoc = await firestore.doc(streamDocumentPath).get()
         const livestream = livestreamDoc.data()

         if (!livestream.test) {
            const storedTokenDoc = await firestore
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
         const rtcToken = RtcTokenBuilder.buildTokenWithUserAccount(
            agoraCredentials.appID,
            agoraCredentials.appCertificate,
            channelName,
            uid,
            rtcRole,
            privilegeExpiredTs,
            privilegeExpiredTs
         )
         return {
            status: 200,
            token: { rtcToken: rtcToken },
         }
      } else {
         const rtcToken = RtcTokenBuilder.buildTokenWithUserAccount(
            agoraCredentials.appID,
            agoraCredentials.appCertificate,
            channelName,
            uid,
            rtcRole,
            privilegeExpiredTs,
            privilegeExpiredTs
         )
         return {
            status: 200,
            token: { rtcToken: rtcToken },
         }
      }
   }
)

export const fetchAgoraRtmToken = functions.https.onCall(
   async (request: CallableRequest<AgoraRTMTokenRequest>) => {
      const { uid } = request.data
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
         privilegeExpiredTs
      )

      return {
         status: 200,
         token: { rtmToken: rtmToken },
      }
   }
)
