import AgoraClient from "./api/agora"
import functions = require("firebase-functions")
import {
   livestreamGetSecureToken,
   livestreamSetIsRecording,
   livestreamUpdateRecordingToken,
} from "./lib/livestream"

exports.startRecordingLivestream = functions.https.onCall(async (data) => {
   const livestreamId = data.streamId
   const token = data.token
   const agora = new AgoraClient()

   let acquire = null
   try {
      acquire = await agora.recordingAcquire(livestreamId)
   } catch (e) {
      throw new functions.https.HttpsError(
         "unknown",
         "Failed to acquire recording"
      )
   }

   const resourceId = acquire.data.resourceId
   const rtcToken = AgoraClient.createRTCToken(livestreamId)

   const storedTokenDoc = await livestreamGetSecureToken(livestreamId)
   const storedToken = storedTokenDoc.data().value
   if (storedToken !== token) {
      throw new functions.https.HttpsError(
         "permission-denied",
         "Token mismatch"
      )
   }

   let start = null
   try {
      const url = `https://careerfairy.io/streaming/${livestreamId}/viewer?token=${token}&isRecordingWindow=true`
      start = await agora.recordingStart(
         livestreamId,
         resourceId,
         rtcToken,
         url
      )
   } catch (e) {
      throw new functions.https.HttpsError(
         "unknown",
         "Failed to start recording"
      )
   }

   await livestreamUpdateRecordingToken(livestreamId, {
      sid: start.data.sid,
      resourceId: resourceId,
   })

   await livestreamSetIsRecording(livestreamId)
})

exports.stopRecordingBreakoutRoom = functions.https.onCall(
   async (data, context) => {}
)
