import { logger } from "firebase-functions/v2"
import { Timestamp } from "../../api/firestoreAdmin"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import { BaseTranscriptionService } from "./BaseTranscriptionService"
import { saveTranscriptionToGCS } from "./storage"
import { ITranscriptionClient } from "./types"
import { calculateBackoffDelay, getErrorMessage, sleep } from "./utils"

const MAX_RETRIES = 5

type ProcessTranscriptionOptions = {
   retryCount?: number
   isRetry?: boolean
}

/**
 * TranscriptionService handles the entire transcription workflow
 * including retries with exponential backoff
 */
export class TranscriptionService extends BaseTranscriptionService {
   private transcriptionClient: ITranscriptionClient

   constructor(
      livestreamRepo: ILivestreamFunctionsRepository,
      transcriptionClient: ITranscriptionClient
   ) {
      super(livestreamRepo)
      this.transcriptionClient = transcriptionClient
   }

   /**
    * Process transcription for a livestream with retry logic.
    * This method will await all retry attempts before returning.
    *
    * @param livestreamId - The livestream ID
    * @param recordingUrl - The recording URL to transcribe
    * @returns Promise that resolves when transcription completes or all retries are exhausted
    */
   async processLivestreamTranscription(
      livestreamId: string,
      recordingUrl: string
   ): Promise<void> {
      return this.transcribeLivestream(livestreamId, recordingUrl)
   }

   private async transcribeLivestream(
      livestreamId: string,
      recordingUrl: string,
      options?: ProcessTranscriptionOptions
   ): Promise<void> {
      const { retryCount = 0, isRetry = false } = options ?? {}

      let failedBecauseAnotherTranscriptionIsInProcess = false

      try {
         const transcription = await this.livestreamRepo.getTranscriptionStatus(
            livestreamId
         )

         const shouldSkip =
            transcription?.status?.state === "transcribing" ||
            (transcription?.status?.state === "transcription-failed" &&
               transcription?.status?.retryCount < MAX_RETRIES)

         if (!isRetry && shouldSkip) {
            logger.warn("Transcription already in progress, skipping", {
               livestreamId,
            })
            failedBecauseAnotherTranscriptionIsInProcess = true
            throw new Error("Transcription already in progress, skipping")
         }

         logger.info("Starting transcription process", {
            livestreamId,
            recordingUrl,
            retryCount,
         })

         if (!isRetry) {
            await this.livestreamRepo.initiateTranscription(
               livestreamId,
               this.transcriptionClient.provider
            )
         }

         logger.info(`Calling ${this.transcriptionClient.provider} API`, {
            livestreamId,
            recordingUrl,
         })

         const result = await this.transcriptionClient.transcribeAudio(
            recordingUrl
         )

         logger.info(
            `${this.transcriptionClient.provider} transcription completed`,
            {
               livestreamId,
               transcriptLength: result.transcript.length,
               confidence: result.confidence,
               duration: result.duration,
            }
         )

         // Save to GCS
         const gcsPath = await saveTranscriptionToGCS(livestreamId, result)

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

         // If the transcription failed because another transcription is in process, throw the error
         // and do not attempt to retry
         if (failedBecauseAnotherTranscriptionIsInProcess) {
            throw error
         }

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
            return await this.transcribeLivestream(livestreamId, recordingUrl, {
               retryCount: retryCount + 1,
               isRetry: true,
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
