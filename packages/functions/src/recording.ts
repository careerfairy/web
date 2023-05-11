import AgoraClient from "./api/agora"
import functions = require("firebase-functions")
import {
   livestreamGetRecordingToken,
   livestreamGetSecureToken,
   livestreamSetIsRecording,
   livestreamUpdateRecordingToken,
   updateUnfinishedLivestreams,
} from "./lib/livestream"
import { logAxiosErrorAndThrow } from "./util"
import {
   downloadLink,
   S3_ROOT_PATH,
   MAX_RECORDING_HOURS,
} from "@careerfairy/shared-lib/livestreams/recordings"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import config from "./config"

/**
 * Automatically record a livestream
 *
 * Starts when the livestream starts
 * Stops when the livestream ends
 */
export const automaticallyRecordLivestream = functions
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}")
   .onUpdate(async (change, context) => {
      const previousValue = change.before.data() as LivestreamEvent
      const newValue = change.after.data() as LivestreamEvent

      await automaticallyRecord(
         context.params.livestreamId,
         previousValue,
         newValue
      )
   })

/**
 * Automatically record a livestream breakout room
 *
 * Starts when the breakout room starts/is opened
 * Stops when the breakout room is closed
 */
export const automaticallyRecordLivestreamBreakoutRoom = functions
   .region(config.region)
   .firestore.document(
      "livestreams/{livestreamId}/breakoutRooms/{breakoutRoomId}"
   )
   .onUpdate(async (change, context) => {
      const previousValue = change.before.data() as LivestreamEvent
      const newValue = change.after.data() as LivestreamEvent

      await automaticallyRecord(
         context.params.livestreamId,
         previousValue,
         newValue,
         context.params.breakoutRoomId
      )
   })

/**
 * Manually start a recording
 *
 * Works for both livestreams and breakout rooms
 */
export const startRecordingLivestream = functions
   .region(config.region)
   .https.onCall(async (data) => {
      await startRecording(data.streamId, data.token, data.breakoutRoomId)
   })

/**
 * Manually stop a recording
 *
 * Works for both livestreams and breakout rooms
 */
export const stopRecordingLivestream = functions
   .region(config.region)
   .https.onCall(async (data) => {
      await stopRecording(data.streamId, data.token, data.breakoutRoomId)
   })

// Business Logic

const automaticallyRecord = async (
   livestreamId: string,
   previousValue: LivestreamEvent,
   newValue: LivestreamEvent,
   breakoutRoomId: string = null
) => {
   // Don't automatically record test events
   // start the recording manually instead
   if (newValue.test === true) {
      return
   }

   if (
      !previousValue.hasStarted &&
      newValue.hasStarted &&
      !newValue.isRecording
   ) {
      const token = (
         await livestreamGetSecureToken(livestreamId, breakoutRoomId)
      )?.value
      await startRecording(livestreamId, token, breakoutRoomId)
   }

   if (!previousValue.hasEnded && newValue.hasEnded && newValue.isRecording) {
      const token = (
         await livestreamGetSecureToken(livestreamId, breakoutRoomId)
      )?.value
      await stopRecording(livestreamId, token, breakoutRoomId)
   }

   // for some reason the event has already ended, but it's still recording
   // stop the recording
   if (
      previousValue.hasEnded &&
      !newValue.hasStarted &&
      newValue.hasEnded &&
      newValue.isRecording
   ) {
      const token = (
         await livestreamGetSecureToken(livestreamId, breakoutRoomId)
      )?.value
      await stopRecording(livestreamId, token, breakoutRoomId)
   }
}

const startRecording = async (
   livestreamId: string,
   token: string,
   breakoutRoomId?: string
) => {
   functions.logger.info("Starting recording")
   const agora = new AgoraClient()

   const cname = breakoutRoomId ?? livestreamId

   let acquire = null
   try {
      acquire = await agora.recordingAcquire(cname)
   } catch (e) {
      logAxiosErrorAndThrow(
         "Failed to acquire recording",
         e,
         livestreamId,
         token,
         breakoutRoomId
      )
   }

   const resourceId = acquire.data.resourceId
   const rtcToken = AgoraClient.createRTCToken(livestreamId)

   const storedTokenDoc = await livestreamGetSecureToken(
      livestreamId,
      breakoutRoomId
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
      const storagePath = [S3_ROOT_PATH, livestreamId]
      let url = `https://careerfairy.io/streaming/${livestreamId}/viewer?token=${token}&isRecordingWindow=true`
      if (breakoutRoomId) {
         url = `https://careerfairy.io/streaming/${livestreamId}/breakout-room/${breakoutRoomId}/viewer?token=${token}&isRecordingWindow=true`
         storagePath.push(breakoutRoomId)
      }

      start = await agora.recordingStart(
         cname,
         resourceId,
         rtcToken,
         url,
         storagePath
      )
   } catch (e) {
      logAxiosErrorAndThrow("Failed to start recording", e, livestreamId)
   }

   await livestreamUpdateRecordingToken(
      livestreamId,
      {
         sid: start.data.sid,
         resourceId: resourceId,
      },
      breakoutRoomId
   )

   await livestreamSetIsRecording(livestreamId, true, breakoutRoomId)
}

const stopRecording = async (
   livestreamId: string,
   token: string,
   breakoutRoomId?: string
) => {
   functions.logger.info("Stopping recording")
   const agora = new AgoraClient()

   const cname = breakoutRoomId ?? livestreamId

   const storedTokenDoc = await livestreamGetSecureToken(
      livestreamId,
      breakoutRoomId
   )
   if (storedTokenDoc?.value !== token) {
      return
   }

   const recordingToken = await livestreamGetRecordingToken(
      livestreamId,
      breakoutRoomId
   )

   const promises = []

   promises.push(
      agora.recordingStop(
         cname,
         recordingToken?.resourceId,
         recordingToken?.sid
      ),
      livestreamSetIsRecording(livestreamId, false, breakoutRoomId)
   )

   Promise.allSettled(promises).then(async (results) => {
      const rejectedPromises = results.filter(
         ({ status }) => status === "rejected"
      ) as PromiseRejectedResult[]

      if (rejectedPromises.length > 0) {
         logAxiosErrorAndThrow(
            "Failed to stop recording",
            rejectedPromises[0].reason,
            livestreamId,
            breakoutRoomId
         )
      }
   })

   functions.logger.info(
      `Download recorded file: ${downloadLink(
         livestreamId,
         recordingToken?.sid,
         breakoutRoomId
      )}`
   )
}

/**
 * Every 30 minutes, it searches for livestreams that have started but have not finished after { MAX_RECORDING_HOURS }
 */
export const checkForUnfinishedLivestreamsAndStopRecording = functions
   .region(config.region)
   .pubsub.schedule("every 30 minutes")
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      try {
         await updateUnfinishedLivestreams()
      } catch (e) {
         logAxiosErrorAndThrow(
            `Failed to update livestreams that have started but have not finished after ${MAX_RECORDING_HOURS} hours`,
            e
         )
      }
   })
