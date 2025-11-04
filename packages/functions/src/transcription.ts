import { RecordingToken } from "@careerfairy/shared-lib/livestreams/livestreams"
import { downloadLink } from "@careerfairy/shared-lib/livestreams/recordings"
import { logger } from "firebase-functions/v2"
import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { livestreamsRepo } from "./api/repositories"
import { TranscriptionService } from "./lib/transcription/TranscriptionService"

/**
 * Runtime configuration for transcription functions
 */
const transcriptionConfig = {
   timeoutSeconds: 540, // 9 minutes - safe buffer under 10 min limit
   memory: "1GiB" as const,
}

/**
 * Firestore trigger that initiates transcription when a recording token is created
 * Triggers on: livestreams/{livestreamId}/recordingToken/token
 */
export const initiateTranscriptionOnRecordingAvailable = onDocumentUpdated(
   {
      ...transcriptionConfig,
      document: "livestreams/{livestreamId}/recordingToken/token",
   },
   async (event) => {
      const livestreamId = event.params.livestreamId

      logger.info("Recording token updated, initiating transcription", {
         livestreamId,
      })

      // Get the recording token data
      const recordingTokenData = event.data?.after?.data() as RecordingToken

      if (!recordingTokenData?.sid) {
         logger.error("Recording token sid is missing", { livestreamId })
         return
      }

      // Initialize service and start transcription
      const service = new TranscriptionService(livestreamsRepo)

      const recordingUrl = downloadLink(livestreamId, recordingTokenData.sid)

      try {
         logger.info("Transcription initiated successfully", { livestreamId })
         await service.processTranscription(livestreamId, recordingUrl)
      } catch (error) {
         logger.error("Failed to initiate transcription", {
            livestreamId,
            error,
            errorMessage:
               error instanceof Error ? error.message : String(error),
         })
         // Error is already logged and handled in the processor
         // The processor will handle retries automatically
      }
   }
)

/**
 * Manual HTTP function for testing transcription
 * Usage: GET /manualTranscription?livestreamId=<id>
 */
export const manualTranscription = onRequest(
   transcriptionConfig,
   async (req, res) => {
      logger.info("Manual transcription triggered", {
         query: req.query,
         method: req.method,
      })

      // Extract livestreamId from query params
      const livestreamId = req.query.livestreamId as string

      if (!livestreamId) {
         logger.error("Missing livestreamId query parameter")
         res.status(400).json({
            error: "Missing required query parameter: livestreamId",
            usage: "GET /manualTranscription?livestreamId=<id>",
         })
         return
      }

      logger.info("Processing manual transcription request", { livestreamId })

      const tokenData = await livestreamsRepo.getLivestreamRecordingToken(
         livestreamId
      )

      if (!tokenData?.sid) {
         logger.error("Recording token sid is missing", { livestreamId })
         res.status(400).json({
            error: "Recording token sid is missing",
         })
         return
      }

      const recordingUrl = downloadLink(livestreamId, tokenData.sid)
      // Initialize service and start transcription
      const service = new TranscriptionService(livestreamsRepo)

      try {
         await service.processTranscription(livestreamId, recordingUrl)

         res.status(200).json({
            success: true,
            message: "Transcription execution done, check transcription status",
            livestreamId,
         })
      } catch (error) {
         const errorMessage =
            error instanceof Error ? error.message : String(error)

         logger.error("Manual transcription failed", {
            livestreamId,
            error,
            errorMessage,
         })

         res.status(500).json({
            success: false,
            error: "Transcription execution failed, check transcription status",
            message: errorMessage,
            livestreamId,
         })
      }
   }
)
