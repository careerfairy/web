import {
   downloadLink,
   downloadLinkWithDate,
} from "@careerfairy/shared-lib/livestreams/recordings"
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
 * - Max timeout: 3600 seconds (60 minutes) - Gen 2 onSchedule HTTP function timeout limit
 * - Scheduler runs: every 10 minutes
 * - Time per livestream: ~40s transcription + 30s wait = ~70s
 * - Buffer for overhead: ~60 seconds
 * - Theoretical max batch size: (3600 - 60) / 70 = ~50.57 livestreams
 * - Using 40 as configured value to safely stay within timeout while maximizing throughput
 * - With 40 livestreams per batch: 40 × 70s = 2800s + 60s buffer = 2860s < 3600s ✓
 * - Processing rate: 40 livestreams every 10 minutes = 240 livestreams per hour
 * - Increased batch size to take advantage of 60-minute timeout limit for Gen 2 scheduled functions
 */
const BATCH_TRANSCRIPTION_CONFIG = {
   BATCH_SIZE: 40, // Calculated for 3600s timeout - see comment above for calculation
   /**
    * Wait 30 seconds after each transcription to allow chapterization to start automatically via GCS trigger
    * and to avoid Claude API rate limiting.
    *
    * Rate limiting context:
    * - Multiple transcription jobs can run simultaneously, but too many concurrent chapterization requests
    *   will trigger Claude API rate limits
    * - This wait period helps stagger chapterization requests to stay within rate limits
    * - Error encountered when rate limits are exceeded:
    *   "Failed after max retries reached: This request would exceed the rate limit for your organization
    *   of 10,000 input tokens per minute. For details, refer to: https://docs.claude.com/en/api/rate-limits. You can see the response headers
    *   for current usage. Contact sales at https://www.anthropic.com/contact-sales to discuss rate limit increases"
    */
   WAIT_AFTER_TRANSCRIPTION_MS: 30_000, // 30 seconds
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

      logger.info(
         `Initiating chapterization from GCS trigger for livestream ${livestreamId}`,
         { filePath }
      )

      const chapterizationService = new ChapterizationService(
         livestreamsRepo,
         ClaudeChapterClient.create()
      )

      try {
         await chapterizationService.processLivestreamChapterization(
            livestreamId
         )

         logger.info(
            `Chapterization completed successfully for livestream ${livestreamId}`
         )
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

      logger.info(
         `Processing manual transcription request for livestream ${livestreamId}`
      )

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
 * Scheduled function that runs every 10 minutes to process a batch of past livestreams for transcription
 *
 * This function:
 * - Queries past livestreams (max 2 years old, not test, not hidden)
 * - Checks if transcription already exists in GCS
 * - Processes transcription for livestreams that need it
 * - Waits 30 seconds after each transcription to allow chapterization to start automatically via GCS trigger
 * - Respects batch size limits based on 3600-second (60-minute) timeout constraints
 */
export const processBatchLivestreamTranscriptions = onSchedule(
   {
      ...transcriptionConfig,
      timeoutSeconds: 3600, // 60 minutes - max timeout for Gen 2 onSchedule functions
      schedule: "every 10 minutes",
      timeZone: "Europe/Zurich",
      memory: "1GiB",
   },
   async () => await handleBatchLivestreamTranscriptions()
)

export const manualBatchLivestreamTranscriptions = onRequest(
   transcriptionConfig,
   async (_req, res) => {
      await handleBatchLivestreamTranscriptions()
      res.status(200)
         .json({ message: "Batch transcription processing completed" })
         .end()
   }
)

const handleBatchLivestreamTranscriptions = async () => {
   logger.info("Starting batch transcription processing", {
      batchSize: BATCH_TRANSCRIPTION_CONFIG.BATCH_SIZE,
   })

   try {
      const livestreams =
         await livestreamsRepo.getLivestreamsNeedingTranscription()

      const totalLivestreamsNeedingWithoutTranscription = livestreams.filter(
         (livestream) => !livestream.transcriptionCompleted
      )

      // Applying in memory filter due to firestore limitations
      // See more: https://firebase.google.com/docs/firestore/query-data/queries#query_limitations
      const livestreamsNeedingTranscription =
         totalLivestreamsNeedingWithoutTranscription.slice(
            0,
            BATCH_TRANSCRIPTION_CONFIG.BATCH_SIZE
         )

      if (livestreamsNeedingTranscription.length === 0) {
         logger.info("No livestreams found needing transcription... skipping")
         return
      }

      logger.info(
         `Found ${livestreamsNeedingTranscription.length} livestreams (out of ${totalLivestreamsNeedingWithoutTranscription.length}) needing transcription... processing`
      )

      const transcriptionService = new TranscriptionService(
         livestreamsRepo,
         DeepgramTranscriptionClient.create()
      )

      const results = {
         success: 0,
         failed: 0,
         errors: [] as Array<{ livestreamId: string; error: string }>,
      }

      for (const [
         index,
         livestream,
      ] of livestreamsNeedingTranscription.entries()) {
         try {
            logger.info(
               `Processing batch livestream transcription ${index + 1} of ${
                  livestreamsNeedingTranscription.length
               } for livestream ${livestream.id}`,
               {
                  title: livestream.title,
               }
            )

            const tokenData = await livestreamsRepo.getLivestreamRecordingToken(
               livestream.id
            )

            if (!tokenData?.sid) {
               logger.warn(
                  `Recording token sid is missing for livestream ${livestream.id}, skipping`
               )
               results.failed++
               results.errors.push({
                  livestreamId: livestream.id,
                  error: "Recording token sid is missing",
               })
               continue
            }

            const recordingUrl = downloadLinkWithDate(
               livestream.start.toDate(),
               livestream.id,
               tokenData.sid
            )

            await transcriptionService.processLivestreamTranscription(
               livestream.id,
               recordingUrl
            )

            logger.info(
               `Transcription completed for livestream ${livestream.id}, waiting before next livestream`,
               {
                  waitMs:
                     BATCH_TRANSCRIPTION_CONFIG.WAIT_AFTER_TRANSCRIPTION_MS,
               }
            )

            if (index < livestreamsNeedingTranscription.length - 1) {
               await sleep(
                  BATCH_TRANSCRIPTION_CONFIG.WAIT_AFTER_TRANSCRIPTION_MS
               )
            }

            results.success++
         } catch (error) {
            logger.error(
               `Failed to process livestream transcription for livestream ${livestream.id}`,
               {
                  error,
                  errorMessage: getErrorMessage(error),
               }
            )
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
