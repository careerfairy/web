import { downloadLink } from "@careerfairy/shared-lib/livestreams/recordings"
import { logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { onObjectFinalized } from "firebase-functions/v2/storage"
import { livestreamsRepo } from "./api/repositories"
import { ChapterizationService } from "./lib/chapterization/ChapterizationService"
import { ClaudeChapterClient } from "./lib/chapterization/clients/ClaudeChapterClient"
import { TranscriptionService } from "./lib/transcription/TranscriptionService"
import { DeepgramTranscriptionClient } from "./lib/transcription/clients/DeepgramTranscriptionClient"
import { getErrorMessage, sleep } from "./lib/transcription/utils"

const transcriptionConfig = {
   timeoutSeconds: 3600, // 1 hour - accommodates full retry cycle
   memory: "1GiB" as const,
}

const PATH_REGEX = /^transcriptions\/livestreams\/([^/]+)\/transcription\.json$/

/**
 * Batch processing configuration for scheduled transcription
 *
 * Batch size calculation:
 * - Max timeout: 3600 seconds (1 hour)
 * - Time per livestream: ~40s transcription + ~60s wait = ~100s
 * - Buffer for overhead: ~200 seconds
 * - Safe batch size: (3600 - 200) / 100 = ~34 livestreams
 * - Using 30 as default to be conservative
 */
const BATCH_TRANSCRIPTION_CONFIG = {
   BATCH_SIZE: 30, // Easily configurable batch size
   MAX_AGE_YEARS: 2, // Maximum age of livestreams to process (2 years)
   WAIT_AFTER_TRANSCRIPTION_MS: 60 * 1000, // 1 minute wait after transcription
} as const

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

      const chapterizationService = new ChapterizationService(
         livestreamsRepo,
         ClaudeChapterClient.create()
      )

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

         const chapterizationService = new ChapterizationService(
            livestreamsRepo,
            ClaudeChapterClient.create()
         )

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
         const transcriptionService = new TranscriptionService(
            livestreamsRepo,
            DeepgramTranscriptionClient.create()
         )

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

/**
 * Scheduled function that runs every hour to process a batch of past livestreams for transcription
 *
 * This function:
 * - Queries past livestreams (max 2 years old, not test, not hidden)
 * - Checks if transcription already exists in GCS
 * - Processes transcription for livestreams that need it
 * - Waits 1 minute after each transcription to allow chapterization to start automatically via GCS trigger
 * - Respects batch size limits based on timeout constraints
 */
export const processBatchLivestreamTranscriptions = onSchedule(
   {
      schedule: "every 1 hours",
      timeZone: "UTC",
      ...transcriptionConfig,
   },
   async () => {
      logger.info("Starting batch transcription processing", {
         batchSize: BATCH_TRANSCRIPTION_CONFIG.BATCH_SIZE,
         maxAgeYears: BATCH_TRANSCRIPTION_CONFIG.MAX_AGE_YEARS,
      })

      try {
         // Query livestreams that need transcription
         const livestreamsNeedingTranscription =
            await livestreamsRepo.getLivestreamsNeedingTranscription(
               BATCH_TRANSCRIPTION_CONFIG.BATCH_SIZE,
               BATCH_TRANSCRIPTION_CONFIG.MAX_AGE_YEARS
            )

         logger.info("Found livestreams needing transcription", {
            count: livestreamsNeedingTranscription.length,
         })

         if (livestreamsNeedingTranscription.length === 0) {
            logger.info("No livestreams found needing transcription")
            return
         }

         // Initialize transcription service
         const transcriptionService = new TranscriptionService(
            livestreamsRepo,
            DeepgramTranscriptionClient.create()
         )

         // Process each livestream in the batch
         const results = {
            success: 0,
            failed: 0,
            errors: [] as Array<{ livestreamId: string; error: string }>,
         }

         for (const livestream of livestreamsNeedingTranscription) {
            try {
               logger.info("Processing livestream transcription", {
                  livestreamId: livestream.id,
                  title: livestream.title,
               })

               // Get recording token to build download URL
               const tokenData =
                  await livestreamsRepo.getLivestreamRecordingToken(
                     livestream.id
                  )

               if (!tokenData?.sid) {
                  logger.warn("Recording token sid is missing, skipping", {
                     livestreamId: livestream.id,
                  })
                  results.failed++
                  results.errors.push({
                     livestreamId: livestream.id,
                     error: "Recording token sid is missing",
                  })
                  continue
               }

               const recordingUrl = downloadLink(livestream.id, tokenData.sid)

               // Process transcription
               await transcriptionService.processLivestreamTranscription(
                  livestream.id,
                  recordingUrl
               )

               logger.info(
                  "Transcription completed, waiting before next livestream",
                  {
                     livestreamId: livestream.id,
                     waitMs:
                        BATCH_TRANSCRIPTION_CONFIG.WAIT_AFTER_TRANSCRIPTION_MS,
                  }
               )

               // Wait 1 minute to allow chapterization to start automatically via GCS trigger
               await sleep(
                  BATCH_TRANSCRIPTION_CONFIG.WAIT_AFTER_TRANSCRIPTION_MS
               )

               logger.info("Livestream transcription completed", {
                  livestreamId: livestream.id,
               })

               results.success++
            } catch (error) {
               logger.error("Failed to process livestream transcription", {
                  livestreamId: livestream.id,
                  error,
                  errorMessage: getErrorMessage(error),
               })
               results.failed++
               results.errors.push({
                  livestreamId: livestream.id,
                  error: getErrorMessage(error),
               })
               // Continue processing other livestreams even if one fails
            }
         }

         logger.info("Batch transcription processing completed", {
            total: livestreamsNeedingTranscription.length,
            success: results.success,
            failed: results.failed,
            errors: results.errors,
         })
      } catch (error) {
         logger.error("Batch transcription processing failed", {
            error,
            errorMessage: getErrorMessage(error),
         })
         throw error
      }
   }
)
