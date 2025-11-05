import { TranscriptionStatus } from "@careerfairy/shared-lib/livestreams/transcriptions"
import { Timestamp } from "firebase-admin/firestore"
import { logger } from "firebase-functions/v2"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import { IChapterizationClient } from "../chapterization/types"
import { BaseTranscriptionService } from "./BaseTranscriptionService"
import {
   fetchTranscriptionFromGCS,
   getTranscriptionFilePath,
   saveTranscriptionToGCS,
} from "./storage"
import { ITranscriptionClient } from "./types"
import { calculateBackoffDelay, getErrorMessage } from "./utils"

const MAX_RETRIES = 5

type ProcessTranscriptionOptions = {
   retryCount?: number
   force?: boolean
}

/**
 * TranscriptionService handles the entire transcription workflow
 * including retries with exponential backoff
 */
export class TranscriptionService extends BaseTranscriptionService {
   private transcriptionClient: ITranscriptionClient
   private chapterizationClient?: IChapterizationClient

   constructor(
      livestreamRepo: ILivestreamFunctionsRepository,
      transcriptionClient: ITranscriptionClient,
      chapterizationClient?: IChapterizationClient
   ) {
      super(livestreamRepo)
      this.transcriptionClient = transcriptionClient
      this.chapterizationClient = chapterizationClient
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
            this.transcriptionClient.provider
         )

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

   /**
    * Process chapterization for a livestream with retry logic.
    * This method will await all retry attempts before returning.
    *
    * @param livestreamId - The livestream ID
    * @returns Promise that resolves when chapterization completes or all retries are exhausted
    */
   async processChapterization(livestreamId: string): Promise<void> {
      if (!this.chapterizationClient) {
         throw new Error("Chapterization client not provided")
      }

      logger.info("Starting chapterization process", {
         livestreamId,
      })

      try {
         // Get transcription status to check if chapterization is already in progress
         const transcriptionStatus =
            await this.livestreamRepo.getTranscriptionStatus(livestreamId)

         if (!transcriptionStatus) {
            throw new Error("Transcription status not found")
         }

         // Get transcription file path from metadata
         const transcriptionFilePath = getTranscriptionFilePath(livestreamId)

         // Update status to generating-chapter
         await this.livestreamRepo.updateTranscriptionStatus(
            livestreamId,
            {
               state: "generating-chapter",
               startedAt: Timestamp.now(),
            } as TranscriptionStatus,
            { chapterProvider: this.chapterizationClient.provider }
         )

         // Fetch transcription from GCS
         const transcriptionData = await fetchTranscriptionFromGCS(livestreamId)

         logger.info("Transcription fetched successfully", {
            livestreamId,
            transcriptLength: transcriptionData.transcript.length,
         })

         logger.info(`Calling ${this.chapterizationClient.provider} API`, {
            livestreamId,
            transcriptLength: transcriptionData.transcript.length,
         })

         // Generate chapters
         const { chapters } = await this.chapterizationClient.generateChapters(
            transcriptionData,
            MAX_RETRIES
         )

         if (!chapters?.length) {
            throw new Error("No chapters generated")
         }

         logger.info(
            `${this.chapterizationClient.provider} chapterization completed`,
            {
               livestreamId,
               chaptersCount: chapters.length,
            }
         )

         // Save chapters to Firestore
         await this.saveChaptersToFirestore(livestreamId, chapters)

         // Mark chapterization as completed
         await this.markChapterizationCompleted(
            livestreamId,
            chapters,
            transcriptionFilePath
         )

         logger.info("Chapterization process completed successfully", {
            livestreamId,
            chaptersCount: chapters.length,
         })
      } catch (error) {
         logger.error("Chapterization process failed", {
            livestreamId,
            error,
            errorMessage: getErrorMessage(error),
         })

         await this.markChapterizationPermanentlyFailed(
            livestreamId,
            error,
            MAX_RETRIES,
            getTranscriptionFilePath(livestreamId)
         )
         throw error
      }
   }
}

// Helper functions

function sleep(ms: number): Promise<void> {
   return new Promise((resolve) => setTimeout(resolve, ms))
}
