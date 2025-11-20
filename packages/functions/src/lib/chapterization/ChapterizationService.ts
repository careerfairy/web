import { Chapter } from "@careerfairy/shared-lib/livestreams"
import { logger } from "firebase-functions/v2"
import { Timestamp } from "../../api/firestoreAdmin"
import { notifyChapterizationPermanentlyFailed } from "../../api/slack"
import config from "../../config"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import {
   fetchTranscriptionFromGCS,
   getTranscriptionFilePath,
} from "../transcription/storage"
import {
   calculateBackoffDelay,
   getErrorMessage,
   sleep,
} from "../transcription/utils"
import { BaseChapterizationService } from "./BaseChaperizationService"
import { IChapterizationClient } from "./types"

const MAX_RETRIES = 0

type ProcessChapterizationOptions = {
   retryCount?: number
   isRetry?: boolean
}

export class ChapterizationService extends BaseChapterizationService {
   private chapterizationClient: IChapterizationClient

   constructor(
      livestreamRepo: ILivestreamFunctionsRepository,
      chapterizationClient: IChapterizationClient
   ) {
      super(livestreamRepo)
      this.chapterizationClient = chapterizationClient
   }

   /**
    * Process chapterization for a livestream with retry logic.
    * This method will await all retry attempts before returning.
    *
    * @param livestreamId - The livestream ID
    * @param options - Processing options
    * @param options.retryCount - Current retry attempt (default: 0)
    * @param options.force - Force processing even if already in progress (default: false)
    * @returns Promise that resolves when chapterization completes or all retries are exhausted
    */
   async processLivestreamChapterization(
      livestreamId: string
   ): Promise<Chapter[]> {
      return this.chapterizeLivestream(livestreamId)
   }

   private async chapterizeLivestream(
      livestreamId: string,
      options?: ProcessChapterizationOptions
   ): Promise<Chapter[]> {
      const { retryCount = 0, isRetry = false } = options ?? {}

      const transcriptionFilePath = getTranscriptionFilePath(livestreamId)

      let failedBecauseAnotherTranscriptionIsInProcess = false

      try {
         const status = await this.livestreamRepo.getChapterizationStatus(
            livestreamId
         )

         // Skip if chapterization is already in progress, or if it failed but hasn't exhausted retries yet
         // (retries are handled internally, so we don't want to start a new process)
         const shouldSkip =
            status?.state === "chapterizing" ||
            (status?.state === "chapterization-failed" &&
               status?.retryCount < MAX_RETRIES)

         if (!isRetry && shouldSkip) {
            logger.warn(
               "Chapterization already in progress or failed, skipping",
               {
                  livestreamId,
               }
            )

            failedBecauseAnotherTranscriptionIsInProcess = true
            throw new Error(
               "Chapterization already in progress or failed, skipping"
            )
         }

         logger.info("Starting chapterization process", {
            livestreamId,
            retryCount,
         })

         // Initiate chapterization with starting status
         if (!isRetry) {
            await this.livestreamRepo.initiateChapterization(
               livestreamId,
               this.chapterizationClient.provider,
               transcriptionFilePath
            )
         }

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
         const result = await this.chapterizationClient.generateChapters(
            transcriptionData,
            MAX_RETRIES
         )

         if (!result?.chapters?.length) {
            throw new Error("No chapters generated")
         }

         logger.info(
            `${this.chapterizationClient.provider} chapterization completed`,
            {
               livestreamId,
               chaptersCount: result.chapters.length,
            }
         )

         // Save chapters to Firestore
         await this.saveChaptersToFirestore(livestreamId, result.chapters)

         // Mark chapterization as completed
         await this.markChapterizationCompleted(
            livestreamId,
            result,
            transcriptionFilePath
         )

         logger.info("Chapterization process completed successfully", {
            livestreamId,
            chaptersCount: result.chapters.length,
         })

         return result.chapters
      } catch (error) {
         logger.error("Chapterization process failed", {
            livestreamId,
            retryCount,
            error,
            errorMessage: getErrorMessage(error),
         })

         // If the chapterization failed because another transcription is in process, throw the error
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
               retryCount: retryCount + 1,
               delayMs: delay,
               nextRetryAt: nextRetryAt.toDate().toISOString(),
            })

            // Mark as failed with retry info
            await this.markChapterizationFailedWithRetry(
               livestreamId,
               error,
               retryCount + 1,
               transcriptionFilePath,
               nextRetryAt
            )

            await sleep(delay)

            // Retry the chapterization - this will await completion
            logger.info("Starting retry attempt", {
               livestreamId,
               retryCount: retryCount + 1,
            })
            return await this.chapterizeLivestream(livestreamId, {
               retryCount: retryCount + 1,
               isRetry: true,
            })
         } else {
            // Max retries reached
            logger.error("Max retries reached, chapterization failed", {
               livestreamId,
               retryCount,
            })

            await this.markChapterizationPermanentlyFailed(
               livestreamId,
               error,
               retryCount,
               transcriptionFilePath
            )

            // Notify Slack about permanent failure
            await this.notifySlackOfPermanentFailure(
               livestreamId,
               error,
               retryCount,
               transcriptionFilePath
            )

            throw error
         }
      }
   }

   private async notifySlackOfPermanentFailure(
      livestreamId: string,
      error: unknown,
      retryCount: number,
      transcriptionFilePath: string
   ): Promise<void> {
      try {
         logger.info(
            "Sending Slack notification about permanent chapterization failure",
            {
               livestreamId,
            }
         )

         await notifyChapterizationPermanentlyFailed(
            config.slackWebhooks.chapterizationPermanentlyFailed,
            {
               livestreamId,
               provider: this.chapterizationClient.provider,
               errorMessage: getErrorMessage(error),
               retryCount,
               transcriptionFilePath,
            }
         )
      } catch (notificationError) {
         logger.error("Failed to send Slack notification", {
            livestreamId,
            notificationError,
            errorMessage: getErrorMessage(notificationError),
         })
      }
   }
}
