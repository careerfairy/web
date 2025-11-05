import {
   LivestreamEvent
} from "@careerfairy/shared-lib/livestreams/livestreams"
import { downloadLink } from "@careerfairy/shared-lib/livestreams/recordings"
import {
   ASRProviders,
   LLMProviders,
} from "@careerfairy/shared-lib/livestreams/transcriptions"
import { logger } from "firebase-functions/v2"
import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { livestreamsRepo } from "./api/repositories"
import { ClaudeChapterClient } from "./lib/chapterization/clients/ClaudeChapterClient"
import { IChapterizationClient } from "./lib/chapterization/types"
import { TranscriptionService } from "./lib/transcription/TranscriptionService"
import { DeepgramTranscriptionClient } from "./lib/transcription/clients/DeepgramTranscriptionClient"
import { ITranscriptionClient } from "./lib/transcription/types"
import { getErrorMessage } from "./lib/transcription/utils"

const TRANSCRIPTION_PROVIDER: ASRProviders = "deepgram"
const CHAPTERIZATION_PROVIDER: LLMProviders = "anthropic"

const transcriptionProviders: Record<ASRProviders, ITranscriptionClient> = {
   deepgram: new DeepgramTranscriptionClient(),
}

const chapterizationProviders: Record<LLMProviders, IChapterizationClient> = {
   anthropic: new ClaudeChapterClient(),
}

/**
 * Runtime configuration for transcription functions
 * Timeout set to 1 hour to accommodate full retry cycle (up to 61 minutes with backoff)
 */
const transcriptionConfig = {
   timeoutSeconds: 3600, // 1 hour - accommodates full retry cycle
   memory: "1GiB" as const,
}


/**
 * Could be on /livestreams and check for transcriptionCompleted but prefer to use the transcription status document
 * because it's more accurate and up to date. And we can use the transcription status document to trigger the chapterization.
 */
export const initiateChapterizationOnTranscriptionCompleted = onDocumentUpdated(
   {
      ...transcriptionConfig,
      document: "livestreams/{livestreamId}",
   },
   async (event) => {
      const livestreamId = event.params.livestreamId

      logger.info("Initiating chapterization on transcription completed", {
         livestreamId,
      })

      const oldLivestreamEvent = event.data?.before?.data() as LivestreamEvent
      const newLivestreamEvent = event.data?.after?.data() as LivestreamEvent

      const transcriptionCompletedChanged =
         newLivestreamEvent?.transcriptionCompleted !==
         oldLivestreamEvent?.transcriptionCompleted

      if (!transcriptionCompletedChanged) {
         logger.info(
            "Transcription completed status not changed, skipping chapterization",
            { livestreamId }
         )
         return
      }

      if (!newLivestreamEvent?.transcriptionCompleted) {
         logger.info(
            "Transcription is not completed, skipping chapterization",
            { livestreamId }
         )
         return
      }

      // Initialize service and start chapterization
      const service = new TranscriptionService(
         livestreamsRepo,
         transcriptionProviders[TRANSCRIPTION_PROVIDER],
         chapterizationProviders[CHAPTERIZATION_PROVIDER]
      )

      try {
         logger.info("Chapterization initiated successfully", { livestreamId })

         await service.processChapterization(livestreamId)

         logger.info(
            "Chapterization process completed (including all retries)",
            {
               livestreamId,
            }
         )
      } catch (error) {
         logger.error("Chapterization failed after all retries", {
            livestreamId,
            error,
            errorMessage: getErrorMessage(error),
         })
         throw error
      }
   }
)

export const manualLivestreamChapterization = onRequest(
   transcriptionConfig,
   async (req, res) => {
      logger.info("Manual chapterization triggered", {
         query: req.query,
         method: req.method,
      })

      const livestreamId = req.query.livestreamId as string

      if (!livestreamId) {
         res.status(400)
            .json({
               error: "Missing required query parameter: livestreamId",
            })
            .end()
         return
      }

      const service = new TranscriptionService(
         livestreamsRepo,
         transcriptionProviders[TRANSCRIPTION_PROVIDER],
         chapterizationProviders[CHAPTERIZATION_PROVIDER]
      )

      await service.processChapterization(livestreamId)

      res.status(200)
         .json({
            success: true,
            message: "Chapterization completed successfully",
            livestreamId,
         })
         .end()
   }
)
/**
 * Manual HTTP function for testing transcription
 * Usage: GET /manualLivestreamTranscription?livestreamId=<id>
 */
export const manualLivestreamTranscription = onRequest(
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
      const service = new TranscriptionService(
         livestreamsRepo,
         transcriptionProviders[TRANSCRIPTION_PROVIDER]
      )

      try {
         await service.processTranscription(livestreamId, recordingUrl, {
            force: true,
         })

         res.status(200).json({
            success: true,
            message:
               "Transcription completed successfully (including all retries if needed).",
            livestreamId,
         })
      } catch (error) {
         const errorMessage = getErrorMessage(error)

         logger.error("Manual transcription failed after all retries", {
            livestreamId,
            error,
            errorMessage,
         })

         res.status(500).json({
            success: false,
            error: "Transcription failed after all retry attempts",
            message: errorMessage,
            livestreamId,
         })
      }
   }
)
