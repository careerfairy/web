import { Chapter, LivestreamChapter } from "@careerfairy/shared-lib/livestreams"
import { TranscriptionStatus } from "@careerfairy/shared-lib/livestreams/transcriptions"
import { BulkWriter, Timestamp } from "firebase-admin/firestore"
import { logger } from "firebase-functions/v2"
import { firestore, storage } from "../../api/firestoreAdmin"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import {
   MAX_RETRIES,
   STORAGE_BUCKET,
   getErrorMessage,
   getTranscriptionFilePath,
} from "../transcription/TranscriptionService"
import { ITranscriptionResult } from "../transcription/types"
import { IChapterizationClient } from "./types"

const WRITE_BATCH = 20 // There will hardly more than 40 chapters per livestream

/**
 * ChapterizationService handles the entire chapterization workflow
 * including retries with exponential backoff and timeout management
 */
export class ChapterizationService {
   private chapterizationClient: IChapterizationClient
   private livestreamRepo: ILivestreamFunctionsRepository

   constructor(
      livestreamRepo: ILivestreamFunctionsRepository,
      chapterizationClient: IChapterizationClient
   ) {
      this.chapterizationClient = chapterizationClient
      this.livestreamRepo = livestreamRepo
   }

   /**
    * Fetch transcription file from GCS
    */
   private async fetchTranscriptionFromGCS(
      livestreamId: string
   ): Promise<ITranscriptionResult> {
      logger.info("Fetching transcription from GCS", { livestreamId })

      const bucket = storage.bucket(STORAGE_BUCKET)
      const filePath = getTranscriptionFilePath(livestreamId)
      const file = bucket.file(filePath)

      try {
         const [exists] = await file.exists()

         if (!exists) {
            throw new Error(`Transcription file not found at ${filePath}`)
         }

         const [contents] = await file.download()
         const transcriptionData = JSON.parse(
            contents.toString("utf-8")
         ) as ITranscriptionResult

         logger.info("Transcription fetched successfully", {
            livestreamId,
            transcriptLength: transcriptionData.transcript.length,
         })

         return transcriptionData
      } catch (error) {
         logger.error("Failed to fetch transcription from GCS", {
            livestreamId,
            filePath,
            error,
            errorMessage: getErrorMessage(error),
         })
         throw error
      }
   }

   /**
    * Save chapters to Firestore subcollection using bulkWriter
    */
   private async saveChaptersToFirestore(
      livestreamId: string,
      chapters: Chapter[]
   ): Promise<void> {
      logger.info("Saving chapters to Firestore", {
         livestreamId,
         chaptersCount: chapters.length,
      })

      // Delete all existing chapters before saving new ones
      await this.livestreamRepo.deleteAllLivestreamChapters(livestreamId)

      const bulkWriter: BulkWriter = firestore.bulkWriter()
      let writeCount = 0

      try {
         for (let index = 0; index < chapters.length; index++) {
            const chapter = chapters[index]

            const chapterRef = firestore
               .collection("livestreams")
               .doc(livestreamId)
               .collection("chapters")
               .doc()

            const livestreamChapter: LivestreamChapter = {
               ...chapter,
               documentType: "livestreamChapter",
               id: chapterRef.id,
               livestreamId,
               createdAt: Timestamp.now(),
               chapterIndex: index,
            }

            bulkWriter
               .set(chapterRef, livestreamChapter)
               .then(() => {
                  writeCount++
               })
               .catch((error) => {
                  logger.error("bulkWriter.set failed for chapter", {
                     livestreamId,
                     chapterIndex: index,
                     error,
                     errorMessage: getErrorMessage(error),
                  })
               })

            // Flush periodically to avoid memory issues
            if ((index + 1) % WRITE_BATCH === 0) {
               await bulkWriter.flush()
               logger.info("Flushed bulkWriter batch", {
                  livestreamId,
                  batchNumber: Math.floor((index + 1) / WRITE_BATCH),
               })
            }
         }

         // Final flush for any remaining writes
         await bulkWriter.flush()

         // Close bulkWriter to ensure all writes are committed
         await bulkWriter.close()

         logger.info("Chapters saved to Firestore successfully", {
            livestreamId,
            chaptersCount: chapters.length,
            writeCount,
         })
      } catch (error) {
         logger.error("Failed to save chapters to Firestore", {
            livestreamId,
            error,
            errorMessage: getErrorMessage(error),
         })
         throw error
      }
   }

   /**
    * Mark chapterization as completed with results
    */
   private async markChapterizationCompleted(
      livestreamId: string,
      chapters: Chapter[],
      transcriptionFilePath: string
   ): Promise<void> {
      await this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
         state: "chapterization-completed",
         completedAt: Timestamp.now(),
         chaptersCount: chapters.length,
         confidenceAvg: 0, // Not applicable for chapterization
         metadata: {
            transcriptionFilePath,
            chaptersCount: chapters.length,
         },
      } as TranscriptionStatus)
   }

   /**
    * Mark chapterization as permanently failed after all retries exhausted
    */
   private async markChapterizationPermanentlyFailed(
      livestreamId: string,
      error: unknown,
      retryCount: number,
      transcriptionFilePath: string
   ): Promise<void> {
      await this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
         state: "chapterization-failed",
         errorMessage: `Max retries reached: ${getErrorMessage(error)}`,
         failedAt: Timestamp.now(),
         retryCount,
         metadata: {
            transcriptionFilePath,
            chaptersCount: 0,
         },
      } as TranscriptionStatus)
   }

   /**
    * Process chapterization for a livestream with retry logic.
    * This method will await all retry attempts before returning.
    *
    * @param livestreamId - The livestream ID
    * @param options - Processing options
    * @param options.retryCount - Current retry attempt (default: 0)
    * @param options.force - Force processing even if already in progress (default: false)
    * @param options.startTime - Start time for timeout tracking (default: now)
    * @returns Promise that resolves when chapterization completes or all retries are exhausted
    */
   async processChapterization(livestreamId: string): Promise<void> {
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
         const transcriptionData = await this.fetchTranscriptionFromGCS(
            livestreamId
         )

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
