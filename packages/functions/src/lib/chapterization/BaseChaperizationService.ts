import { Chapter, LivestreamChapter } from "@careerfairy/shared-lib/livestreams"
import { ChapterizationStatus } from "@careerfairy/shared-lib/livestreams/chapters"
import { BulkWriter } from "firebase-admin/firestore"
import { logger } from "firebase-functions/v2"
import { Timestamp, firestore } from "../../api/firestoreAdmin"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import { getErrorMessage } from "../transcription/utils"

const WRITE_BATCH = 20 // There will hardly more than 40 chapters per livestream

export class BaseChapterizationService {
   protected livestreamRepo: ILivestreamFunctionsRepository

   constructor(livestreamRepo: ILivestreamFunctionsRepository) {
      this.livestreamRepo = livestreamRepo
   }

   /**
    * Mark chapterization as completed with results
    */
   protected async markChapterizationCompleted(
      livestreamId: string,
      chapters: Chapter[],
      transcriptionFilePath: string
   ): Promise<void> {
      const firstChapter = chapters[0]

      const status: ChapterizationStatus = {
         state: "chapterization-completed",
         chaptersCount: chapters.length,
         firstChapter,
         transcriptionFilePath,
      }

      await this.livestreamRepo.updateChapterizationStatus(livestreamId, status)
   }

   /**
    * Mark chapterization as failed with retry information
    */
   protected async markChapterizationFailedWithRetry(
      livestreamId: string,
      error: unknown,
      retryCount: number,
      transcriptionFilePath: string,
      nextRetryAt: Timestamp
   ): Promise<void> {
      const status: ChapterizationStatus = {
         state: "chapterization-failed",
         errorMessage: getErrorMessage(error),
         failedAt: Timestamp.now(),
         transcriptionFilePath,
         retryCount,
         nextRetryAt,
      }

      await this.livestreamRepo.updateChapterizationStatus(livestreamId, status)
   }

   /**
    * Mark chapterization as permanently failed after all retries exhausted
    */
   protected async markChapterizationPermanentlyFailed(
      livestreamId: string,
      error: unknown,
      retryCount: number,
      transcriptionFilePath: string
   ): Promise<void> {
      const status: ChapterizationStatus = {
         state: "chapterization-failed",
         errorMessage: `Failed after max retries reached: ${getErrorMessage(
            error
         )}`,
         failedAt: Timestamp.now(),
         transcriptionFilePath,
         retryCount,
         nextRetryAt: null,
      }

      await this.livestreamRepo.updateChapterizationStatus(livestreamId, status)
   }

   /**
    * Save chapters to Firestore subcollection using bulkWriter
    */
   protected async saveChaptersToFirestore(
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
         for (const [index, chapter] of chapters.entries()) {
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
               .then(() => writeCount++)
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
}
