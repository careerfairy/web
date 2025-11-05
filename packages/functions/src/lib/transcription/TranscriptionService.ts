import { Timestamp } from "firebase-admin/firestore"
import { logger } from "firebase-functions/v2"
import { storage } from "../../api/firestoreAdmin"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import { DeepgramClient } from "../deepgram/client"

const GCS_BASE_PATH = "transcriptions/livestreams"
const STORAGE_BUCKET = "careerfairy-e1fd9.appspot.com"

const MAX_RETRIES = 5
const BASE_DELAY_MS = 180_000 // 3 minutes
const MAX_DELAY_MS = 1_200_000 // 20 minutes

/**
 * Extract error message from unknown error type
 *
 * @param error - The error to extract message from
 * @returns The error message string
 */
export function getErrorMessage(error: unknown): string {
   return error instanceof Error ? error.message : String(error)
}

type ProcessTranscriptionOptions = {
   retryCount?: number
   force?: boolean
}

/**
 * Calculate exponential backoff delay with progression:
 * - Retry 1: 3 minutes
 * - Retry 2: 6 minutes
 * - Retry 3: 12 minutes
 * - Retry 4: 20 minutes (capped)
 * - Retry 5: 20 minutes (capped)
 * Total: ~61 minutes, utilizing most of the 1-hour function timeout
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
    * Mark transcription as completed with results
    */
   private async markTranscriptionCompleted(
      livestreamId: string,
      result: {
         transcript: string
         confidence: number
         language: string
         languageConfidence: number
      },
      recordingUrl: string,
      gcsPath: string
   ): Promise<void> {
      const transcriptText = result.transcript.substring(0, 500)

      await this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
         state: "transcriptioncompleted",
         completedAt: Timestamp.now(),
         transcriptText,
         confidenceAvg: result.confidence,
         metadata: {
            language: result.language,
            languageConfidence: result.languageConfidence,
            recordingId: recordingUrl,
            transcriptionFilePath: gcsPath,
         },
      })

      await this.livestreamRepo.updateLivestreamTranscriptionCompleted(
         livestreamId
      )
   }

   /**
    * Mark transcription as failed with retry information
    */
   private async markTranscriptionFailedWithRetry(
      livestreamId: string,
      error: unknown,
      retryCount: number,
      recordingUrl: string,
      nextRetryAt: Timestamp
   ): Promise<void> {
      await this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
         state: "transcription-failed",
         errorMessage: getErrorMessage(error),
         failedAt: Timestamp.now(),
         retryCount,
         nextRetryAt,
         metadata: {
            recordingId: recordingUrl,
         },
      })
   }

   /**
    * Mark transcription as permanently failed after all retries exhausted
    */
   private async markTranscriptionPermanentlyFailed(
      livestreamId: string,
      error: unknown,
      retryCount: number,
      recordingUrl: string
   ): Promise<void> {
      await this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
         state: "transcription-failed",
         errorMessage: `Max retries reached: ${getErrorMessage(error)}`,
         failedAt: Timestamp.now(),
         retryCount,
         metadata: {
            recordingId: recordingUrl,
         },
      })
   }

   /**
    * Process transcription for a livestream with retry logic.
    * This method will await all retry attempts before returning.
    *
    * @param livestreamId - The livestream ID
    * @param recordingUrl - The recording URL to transcribe
    * @param options - Processing options
    * @param options.retryCount - Current retry attempt (default: 0)
    * @param options.force - Force processing even if already in progress (default: false)
    * @returns Promise that resolves when transcription completes or all retries are exhausted
    */
   async processTranscription(
      livestreamId: string,
      recordingUrl: string,
      options?: ProcessTranscriptionOptions
   ): Promise<void> {
      const { retryCount = 0, force = false } = options ?? {}

      logger.info("Starting transcription process", {
         livestreamId,
         recordingUrl,
         retryCount,
      })

      try {
         // Kind of useless
         const inProgress = await this.livestreamRepo.isTranscriptionInProgress(
            livestreamId,
            MAX_RETRIES
         )

         if (inProgress && retryCount === 0 && !force) {
            logger.warn("Transcription already in progress, skipping", {
               livestreamId,
            })
            return
         }

         await this.livestreamRepo.initiateTranscription(
            livestreamId,
            "deepgram"
         )

         logger.info("Calling Deepgram API", { livestreamId, recordingUrl })

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

         // Mark transcription as completed
         await this.markTranscriptionCompleted(
            livestreamId,
            result,
            recordingUrl,
            gcsPath
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
            errorMessage: getErrorMessage(error),
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

            // Mark as failed with retry info
            await this.markTranscriptionFailedWithRetry(
               livestreamId,
               error,
               retryCount + 1,
               recordingUrl,
               nextRetryAt
            )

            // Wait for the backoff delay before retrying
            logger.info("Waiting before retry", {
               livestreamId,
               delayMs: delay,
            })

            await sleep(delay)

            // Retry the transcription - this will await completion
            logger.info("Starting retry attempt", {
               livestreamId,
               retryCount: retryCount + 1,
            })
            return await this.processTranscription(livestreamId, recordingUrl, {
               retryCount: retryCount + 1,
               force,
            })
         } else {
            // Max retries reached
            logger.error("Max retries reached, transcription failed", {
               livestreamId,
               retryCount,
            })

            await this.markTranscriptionPermanentlyFailed(
               livestreamId,
               error,
               retryCount,
               recordingUrl
            )

            throw error
         }
      }
   }
}

/**
 * Get the GCS file path for a transcription
 *
 * @param livestreamId - The livestream ID
 * @returns The GCS path for the transcription file
 */
export function getTranscriptionFilePath(livestreamId: string): string {
   return `${GCS_BASE_PATH}/${livestreamId}/transcription.json`
}

/**
 * Save transcription data to Google Cloud Storage
 *
 * @param livestreamId - The livestream ID
 * @param transcriptionData - The transcription data to save
 * @returns The GCS path where the file was saved
 */
export async function saveTranscriptionToGCS(
   livestreamId: string,
   transcriptionData: any
): Promise<string> {
   logger.info("Saving transcription to GCS", { livestreamId })

   const bucket = storage.bucket(STORAGE_BUCKET)
   const filePath = getTranscriptionFilePath(livestreamId)
   const file = bucket.file(filePath)

   try {
      // Convert data to JSON string
      const jsonData = JSON.stringify(transcriptionData, null, 2)

      // Convert to Buffer for proper upload
      const buffer = Buffer.from(jsonData, "utf-8")

      // Save to GCS using save method with Buffer
      await file.save(buffer, {
         contentType: "application/json",
         metadata: {
            metadata: {
               livestreamId,
               uploadedAt: new Date().toISOString(),
            },
         },
      })

      logger.info("Transcription saved to GCS successfully", {
         livestreamId,
         filePath,
         size: buffer.length,
      })

      // Return the GCS path
      return `gs://${bucket.name}/${filePath}`
   } catch (error) {
      logger.error("Failed to save transcription to GCS", {
         livestreamId,
         filePath,
         error,
         errorMessage: getErrorMessage(error),
      })
      throw error
   }
}

function sleep(ms: number): Promise<void> {
   return new Promise((resolve) => setTimeout(resolve, ms))
}
