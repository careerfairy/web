import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import { LLMProviders } from "@careerfairy/shared-lib/livestreams/chapters"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams/livestreams"
import { downloadLink } from "@careerfairy/shared-lib/livestreams/recordings"
import { ASRProviders } from "@careerfairy/shared-lib/livestreams/transcriptions"
import axios from "axios"
import { logger } from "firebase-functions/v2"
import { onDocumentUpdated } from "firebase-functions/v2/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { livestreamsRepo } from "./api/repositories"
import config from "./config"
import { ChapterizationService } from "./lib/chapterization/ChapterizationService"
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

const transcriptionService = new TranscriptionService(
   livestreamsRepo,
   transcriptionProviders[TRANSCRIPTION_PROVIDER]
)

const chapterizationService = new ChapterizationService(
   livestreamsRepo,
   chapterizationProviders[CHAPTERIZATION_PROVIDER]
)

const transcriptionConfig = {
   timeoutSeconds: 3600, // 1 hour - accommodates full retry cycle
   memory: "1GiB" as const,
}

export const initiateChapterizationOnTranscriptionCompleted = onDocumentUpdated(
   {
      memory: "1GiB",
      timeoutSeconds: 180, // 3 minutes, could be increased if needed according the axios timeout
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
         oldLivestreamEvent?.transcriptionCompleted !== true &&
         newLivestreamEvent?.transcriptionCompleted === true

      if (!transcriptionCompletedChanged) {
         logger.info(
            "Transcription is not completed, skipping chapterization call",
            { livestreamId }
         )
         return
      }

      logger.info("Triggering chapterization", { livestreamId })

      try {
         await axios.get(
            `${config.functionsBaseUrl}/${FUNCTION_NAMES.startLivestreamChapterization}?livestreamId=${livestreamId}`,
            {
               /**
                * 2 minute timeout, should be more than enough for the chapterization to complete.
                *
                * Otherwise it will throw timeout error, which can be ignored since the called function will continue
                * with a longer timeout and retries.
                *
                * It takes usually 30 seconds to 1 minute to complete.
                */
               timeout: 2 * 60 * 1000,
            }
         )

         logger.info("Chapterization completed successfully", { livestreamId })
      } catch (error) {
         const isTimeoutError =
            error?.code === "ECONNABORTED" ||
            error?.message?.toLowerCase()?.includes("timeout")

         if (isTimeoutError) {
            logger.warn(
               "Chapterization trigger timed out (called function will continue)",
               {
                  livestreamId,
               }
            )
         } else {
            logger.error(
               "Chapterization trigger failed with non-timeout error",
               {
                  livestreamId,
                  error,
                  errorMessage: getErrorMessage(error),
               }
            )
            throw error
         }
      }
   }
)

export const startLivestreamChapterization = onRequest(
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

      try {
         const livestream = await livestreamsRepo.getById(livestreamId)

         if (!livestream) throw new Error("Livestream not found")

         const chapters =
            await chapterizationService.processLivestreamChapterization(
               livestreamId
            )

         res.status(200)
            .json({
               success: true,
               message: "Chapterization completed successfully",
               livestreamId,
               chapters,
            })
            .end()
      } catch (error) {
         res.status(500)
            .json({
               success: false,
               error: "Chapterization failed after all retries",
               livestreamId,
               errorMessage: getErrorMessage(error),
            })
            .end()
      }
   }
)
/**
 * Manual HTTP function for testing transcription
 * Usage: GET /manualLivestreamTranscription?livestreamId=<id>
 */
export const startLivestreamTranscription = onRequest(
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
         res.status(400)
            .json({
               error: "Missing required query parameter: livestreamId",
               usage: "GET /manualTranscription?livestreamId=<id>",
            })
            .end()
         return
      }

      logger.info("Processing manual transcription request", { livestreamId })

      const tokenData = await livestreamsRepo.getLivestreamRecordingToken(
         livestreamId
      )

      if (!tokenData?.sid) {
         logger.error("Recording token sid is missing", { livestreamId })
         res.status(400)
            .json({
               error: "Recording token sid is missing",
            })
            .end()
         return
      }

      const recordingUrl = downloadLink(livestreamId, tokenData.sid)
      // Initialize service and start transcription
      try {
         await transcriptionService.processLivestreamTranscription(
            livestreamId,
            recordingUrl
         )

         res.status(200)
            .json({
               success: true,
               message:
                  "Transcription completed successfully (including all retries if needed).",
               livestreamId,
            })
            .end()
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
