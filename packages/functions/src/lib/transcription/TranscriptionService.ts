import { Timestamp } from "firebase-admin/firestore"
import { logger } from "firebase-functions/v2"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import { DeepgramClient } from "../deepgram/client"
import { saveTranscriptionToGCS } from "./storage"

const MAX_RETRIES = 5
const BASE_DELAY_MS = 60000 // 1 minute
const MAX_DELAY_MS = 300000 // 5 minutes

/**
 * Calculate exponential backoff delay
 *
 * @param retryCount - Current retry attempt (0-based)
 * @returns Delay in milliseconds
 */
function calculateBackoffDelay(retryCount: number): number {
   const delay = BASE_DELAY_MS * Math.pow(2, retryCount)
   return Math.min(delay, MAX_DELAY_MS)
}

/**
 * TranscriptionService handles the entire transcription workflow
 * including retries with exponential backoff
 */
export class TranscriptionService {
   private deepgramClient: DeepgramClient
   private livestreamRepo: ILivestreamFunctionsRepository

   constructor(livestreamRepo: ILivestreamFunctionsRepository) {
      this.deepgramClient = new DeepgramClient()
      this.livestreamRepo = livestreamRepo
   }

   /**
    * Process transcription for a livestream with retry logic
    *
    * @param livestreamId - The livestream ID
    * @param sid - Optional recording sid (if not provided, will be fetched)
    * @param retryCount - Current retry attempt (default: 0)
    */
   async processTranscription(
      livestreamId: string,
      recordingUrl: string,
      retryCount = 0
   ): Promise<void> {
      logger.info("Starting transcription process", {
         livestreamId,
         recordingUrl,
         retryCount,
      })

      try {
         // Kind of useless
         // Check if transcription is already in progress
         const inProgress = await this.livestreamRepo.isTranscriptionInProgress(
            livestreamId,
            MAX_RETRIES
         )
         if (inProgress && retryCount === 0) {
            logger.warn("Transcription already in progress, skipping", {
               livestreamId,
            })
            return
         }

         // Initiate transcription (creates or updates to "transcribing" state)
         await this.livestreamRepo.initiateTranscription(livestreamId)

         // Call Deepgram API
         logger.info("Calling Deepgram API", { livestreamId, recordingUrl })

         if (retryCount <= MAX_RETRIES - 1) {
            throw new Error("Transcription failed")
         }

         const result = await this.deepgramClient.transcribeAudio(recordingUrl)

         logger.info("Deepgram transcription completed", {
            livestreamId,
            transcriptLength: result.transcript.length,
            confidence: result.confidence,
            duration: result.duration,
         })

         // Save to GCS
         const gcsPath = await saveTranscriptionToGCS(
            livestreamId,
            result.rawResponse
         )

         // Calculate average confidence
         const confidenceAvg = result.confidence

         // Extract a snippet of the transcript for quick reads
         const transcriptText = result.transcript.substring(0, 500)

         // Update status to "completed"
         await this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
            state: "completed",
            completedAt: Timestamp.now(),
            transcriptText,
            confidenceAvg,
            metadata: {
               language: result.language,
               languageConfidence: result.languageConfidence,
               recordingId: recordingUrl,
               transcriptionFilePath: gcsPath,
            },
         })

         // Update livestream document
         await this.livestreamRepo.updateLivestreamTranscriptionCompleted(
            livestreamId
         )

         logger.info("Transcription process completed successfully", {
            livestreamId,
            gcsPath,
         })
      } catch (error) {
         logger.error("Transcription process failed", {
            livestreamId,
            recordingUrl,
            retryCount,
            error,
            errorMessage:
               error instanceof Error ? error.message : String(error),
         })

         // Handle retry logic
         if (retryCount < MAX_RETRIES) {
            const delay = calculateBackoffDelay(retryCount)
            const nextRetryAt = Timestamp.fromMillis(Date.now() + delay)

            logger.info("Scheduling retry", {
               livestreamId,
               recordingUrl,
               retryCount: retryCount + 1,
               delayMs: delay,
               nextRetryAt: nextRetryAt.toDate().toISOString(),
            })

            // Update status with retry info
            await this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
               state: "transcription-failed",
               errorMessage:
                  error instanceof Error ? error.message : String(error),
               failedAt: Timestamp.now(),
               retryCount: retryCount + 1,
               nextRetryAt,
               metadata: {
                  recordingId: recordingUrl,
               },
            })

            // Schedule retry using setTimeout
            setTimeout(() => {
               this.processTranscription(
                  livestreamId,
                  recordingUrl,
                  retryCount + 1
               ).catch((retryError) => {
                  logger.error("Retry execution failed", {
                     livestreamId,
                     retryCount: retryCount + 1,
                     retryError,
                  })
               })
            }, delay)
         } else {
            // Max retries reached
            logger.error("Max retries reached, transcription failed", {
               livestreamId,
               retryCount,
            })

            await this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
               state: "transcription-failed",
               errorMessage:
                  error instanceof Error
                     ? `Max retries reached: ${error.message}`
                     : `Max retries reached: ${String(error)}`,
               failedAt: Timestamp.now(),
               retryCount,
               metadata: {
                  recordingId: recordingUrl,
               },
            })

            throw error
         }
      }
   }
}
