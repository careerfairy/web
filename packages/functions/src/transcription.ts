import { LLMProviders } from "@careerfairy/shared-lib/livestreams/chapters"
import { downloadLink } from "@careerfairy/shared-lib/livestreams/recordings"
import { ASRProviders } from "@careerfairy/shared-lib/livestreams/transcriptions"
import { logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import { onObjectFinalized } from "firebase-functions/v2/storage"
import { livestreamsRepo } from "./api/repositories"
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

const PATH_REGEX = /^transcriptions\/livestreams\/([^/]+)\/transcription\.json$/

export const initiateChapterizationOnTranscriptionCompleted = onObjectFinalized(
   {
      memory: "256MiB",
      timeoutSeconds: 540,
      bucket: "careerfairy-e1fd9.appspot.com",
   },
   async (event) => {
      const filePath = event.data.name

      logger.info("GCS transcription file finalized", { filePath })

      const match = filePath.match(PATH_REGEX)
      if (!match) {
         logger.info(
            "File path does not match transcription pattern, skipping",
            {
               filePath,
            }
         )
         return
      }

      const livestreamId = match[1]

      if (!livestreamId) {
         logger.warn("Could not extract livestreamId from file path", {
            filePath,
         })
         return
      }

      logger.info("Initiating chapterization from GCS trigger", {
         livestreamId,
         filePath,
      })

      try {
         await chapterizationService.processLivestreamChapterization(
            livestreamId
         )

         logger.info("Chapterization completed successfully", { livestreamId })
      } catch (error) {
         logger.error("Chapterization failed", {
            livestreamId,
            error,
            errorMessage: getErrorMessage(error),
         })
         throw error
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
