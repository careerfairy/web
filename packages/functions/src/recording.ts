import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   downloadLink,
   MAX_RECORDING_HOURS,
   S3_ROOT_PATH,
} from "@careerfairy/shared-lib/livestreams/recordings"
import { onDocumentUpdated } from "firebase-functions/firestore"
import { onCall } from "firebase-functions/https"
import { onSchedule } from "firebase-functions/scheduler"
import AgoraClient from "./api/agora"
import {
   livestreamGetRecordingToken,
   livestreamGetSecureToken,
   livestreamSetIsRecording,
   livestreamUpdateRecordingToken,
   updateUnfinishedLivestreams,
} from "./lib/livestream"
import { logAxiosErrorAndThrow } from "./util"
import functions = require("firebase-functions")

/**
 * Automatically record a live stream
 *
 * Starts when the live stream starts
 * Stops when the live stream ends
 */
export const automaticallyRecordLivestream = onDocumentUpdated(
   "livestreams/{livestreamId}",
   async (event) => {
      const previousValue = event.data?.before?.data() as LivestreamEvent
      const newValue = event.data?.after?.data() as LivestreamEvent

      await automaticallyRecord(
         event.params.livestreamId,
         previousValue,
         newValue
      )
   }
)

/**
 * Automatically record a live stream breakout room
 *
 * Starts when the breakout room starts/is opened
 * Stops when the breakout room is closed
 */
export const automaticallyRecordLivestreamBreakoutRoom = onDocumentUpdated(
   "livestreams/{livestreamId}/breakoutRooms/{breakoutRoomId}",
   async (event) => {
      const previousValue = event.data?.before?.data() as LivestreamEvent
      const newValue = event.data?.after?.data() as LivestreamEvent

      await automaticallyRecord(
         event.params.livestreamId,
         previousValue,
         newValue,
         event.params.breakoutRoomId
      )
   }
)

/**
 * Manually start a recording
 *
 * Works for both live streams and breakout rooms
 */
export const startRecordingLivestream = onCall(async ({ data }) => {
   functions.logger.info(
      `Manually starting recording for stream: ${data.streamId}`,
      { breakoutRoomId: data.breakoutRoomId }
   )
   await startRecording(data.streamId, data.token, data.breakoutRoomId)
})

/**
 * Manually stop a recording
 *
 * Works for both live streams and breakout rooms
 */
export const stopRecordingLivestream = onCall(async ({ data }) => {
   functions.logger.info(
      `Manually stopping recording for stream: ${data.streamId}`,
      { breakoutRoomId: data.breakoutRoomId }
   )
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
      functions.logger.info(
         `Skipping automatic recording for test event: ${livestreamId}`
      )
      return
   }
   if (
      !previousValue.hasStarted &&
      newValue.hasStarted &&
      !newValue.isRecording
   ) {
      functions.logger.info(
         `Starting recording conditions have been met for newly started live stream: ${livestreamId}`,
         {
            reason: "Live stream has started and is not currently recording",
            previousStarted: previousValue.hasStarted,
            newStarted: newValue.hasStarted,
            isRecording: newValue.isRecording,
         }
      )
      const token = (
         await livestreamGetSecureToken(livestreamId, breakoutRoomId)
      )?.value
      await startRecording(livestreamId, token, breakoutRoomId)
   }

   if (!previousValue.hasEnded && newValue.hasEnded && newValue.isRecording) {
      functions.logger.info(
         `Stopping recording conditions have been met for ended live stream: ${livestreamId}`,
         {
            reason: "Live stream has ended and is still recording",
            previousEnded: previousValue.hasEnded,
            newEnded: newValue.hasEnded,
            isRecording: newValue.isRecording,
         }
      )
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
      functions.logger.warn(
         `Stopping recording conditions have been met for already ended live stream: ${livestreamId}`,
         {
            reason: "Live stream has already ended but is still recording",
            previousEnded: previousValue.hasEnded,
            newStarted: newValue.hasStarted,
            newEnded: newValue.hasEnded,
            isRecording: newValue.isRecording,
         }
      )
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
   functions.logger.info(`Starting recording for: ${livestreamId}`, {
      breakoutRoomId,
   })
   const agora = new AgoraClient()

   const cname = breakoutRoomId ?? livestreamId

   let acquire = null
   try {
      acquire = await agora.recordingAcquire(cname)
      functions.logger.info(
         `Successfully acquired recording for: ${livestreamId}`,
         { resourceId: acquire.data.resourceId }
      )
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
         `Stored token does not match for: ${livestreamId}`,
         { storedToken: storedTokenDoc?.value, providedToken: token }
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

      functions.logger.info(`Starting Agora recording for: ${livestreamId}`, {
         url,
         storagePath,
      })
      start = await agora.recordingStart(
         cname,
         resourceId,
         rtcToken,
         url,
         storagePath
      )
      functions.logger.info(
         `Successfully started Agora recording for: ${livestreamId}`,
         { sid: start.data.sid }
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
   functions.logger.info(
      `Recording started successfully for: ${livestreamId}`,
      { breakoutRoomId }
   )
}

const stopRecording = async (
   livestreamId: string,
   token: string,
   breakoutRoomId?: string
) => {
   functions.logger.info(`Stopping recording for: ${livestreamId}`, {
      breakoutRoomId,
   })
   const agora = new AgoraClient()

   const cname = breakoutRoomId ?? livestreamId

   const storedTokenDoc = await livestreamGetSecureToken(
      livestreamId,
      breakoutRoomId
   )
   if (storedTokenDoc?.value !== token) {
      functions.logger.warn(
         `Token mismatch when stopping recording for: ${livestreamId}`,
         { breakoutRoomId }
      )
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

   await Promise.allSettled(promises).then(async (results) => {
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
      } else {
         functions.logger.info(
            `Successfully stopped recording for: ${livestreamId}`,
            { breakoutRoomId }
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
 * Every 30 minutes, it searches for live streams that have started but have not finished after { MAX_RECORDING_HOURS }
 */
export const checkForUnfinishedLivestreamsAndStopRecording = onSchedule(
   {
      schedule: "every 30 minutes",
      timeZone: "Europe/Zurich",
   },
   async () => {
      functions.logger.info("Checking for unfinished live streams")
      try {
         const updatedLivestreams = await updateUnfinishedLivestreams()
         functions.logger.info("Updated unfinished live streams", {
            count: updatedLivestreams.length,
            livestreams: updatedLivestreams,
         })
      } catch (e) {
         logAxiosErrorAndThrow(
            `Failed to update live streams that have started but have not finished after ${MAX_RECORDING_HOURS} hours`,
            e
         )
      }
   }
)
