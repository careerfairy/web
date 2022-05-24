import AgoraClient from "./api/agora"
import functions = require("firebase-functions")
import {
   livestreamGetById,
   livestreamGetRecordingToken,
   livestreamGetSecureToken,
   livestreamSetIsRecording,
   livestreamUpdateRecordingToken,
} from "./lib/livestream"
import { logAxiosError } from "./util"
import config = require("./config")
import { notifyLivestreamRecordingCreated } from "./api/slack"

export const startRecordingLivestream = functions.https.onCall(async (data) => {
   const livestreamId = data.streamId
   const isBreakout = data.isBreakout
   const breakoutRoomId = data.breakoutRoomId
   const token = data.token
   const agora = new AgoraClient()

   const cname = isBreakout ? `${breakoutRoomId}` : `${livestreamId}`

   let acquire = null
   try {
      acquire = await agora.recordingAcquire(cname)
   } catch (e) {
      logAxiosError("Failed to acquire recording", e)
      throw new functions.https.HttpsError(
         "unknown",
         "Failed to acquire recording"
      )
   }

   const resourceId = acquire.data.resourceId
   const rtcToken = AgoraClient.createRTCToken(livestreamId)

   const storedTokenDoc = await livestreamGetSecureToken(
      livestreamId,
      isBreakout ? breakoutRoomId : null
   )
   if (storedTokenDoc?.value !== token) {
      functions.logger.error(
         "Stored token does not match",
         storedTokenDoc,
         token
      )
      throw new functions.https.HttpsError(
         "permission-denied",
         "Token mismatch"
      )
   }

   let start = null
   try {
      let url = `https://careerfairy.io/streaming/${livestreamId}/viewer?token=${token}&isRecordingWindow=true`
      if (isBreakout) {
         url = `https://careerfairy.io/streaming/${livestreamId}/breakout-room/${breakoutRoomId}/viewer?token=${token}&isRecordingWindow=true`
      }

      start = await agora.recordingStart(cname, resourceId, rtcToken, url)
   } catch (e) {
      logAxiosError("Failed to start recording", e)
      throw new functions.https.HttpsError(
         "unknown",
         "Failed to start recording"
      )
   }

   await livestreamUpdateRecordingToken(
      livestreamId,
      {
         sid: start.data.sid,
         resourceId: resourceId,
      },
      isBreakout ? breakoutRoomId : null
   )

   await livestreamSetIsRecording(
      livestreamId,
      true,
      isBreakout ? breakoutRoomId : null
   )
})

export const stopRecordingLivestream = functions.https.onCall(async (data) => {
   const livestreamId = data.streamId
   const isBreakout = data.isBreakout
   const breakoutRoomId = data.breakoutRoomId
   const token = data.token
   const agora = new AgoraClient()

   const cname = isBreakout ? `${breakoutRoomId}` : `${livestreamId}`

   const storedTokenDoc = await livestreamGetSecureToken(
      livestreamId,
      isBreakout ? breakoutRoomId : null
   )
   if (storedTokenDoc?.value !== token) {
      return
   }

   const recordingToken = await livestreamGetRecordingToken(
      livestreamId,
      isBreakout ? breakoutRoomId : null
   )

   try {
      await agora.recordingStop(
         cname,
         recordingToken?.resourceId,
         recordingToken?.sid
      )

      await livestreamSetIsRecording(
         livestreamId,
         false,
         isBreakout ? breakoutRoomId : null
      )
   } catch (e) {
      logAxiosError("Failed to stop recording", e)
      throw new functions.https.HttpsError(
         "unknown",
         "Failed to stop recording"
      )
   }

   const livestreamObj = await livestreamGetById(livestreamId)
   const id = isBreakout ? breakoutRoomId : livestreamId
   const downloadLink = `https://agora-cf-cloud-recordings.s3.eu-central-1.amazonaws.com/directory1/directory5/${recordingToken?.sid}_${id}_0.mp4`
   await notifyLivestreamRecordingCreated(
      config.slackWebhooks.livestreamAlerts,
      livestreamObj,
      downloadLink
   )
})
