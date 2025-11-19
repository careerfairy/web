import { Chapter, LivestreamChapter } from "@careerfairy/shared-lib/livestreams"
import { BulkWriter } from "firebase-admin/firestore"
import { logger } from "firebase-functions/v2"
import { Timestamp, firestore } from "../../api/firestoreAdmin"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import { getErrorMessage } from "../transcription/utils"
import { IChapterizationResult } from "./types"

const WRITE_BATCH = 20 // There will hardly more than 20 chapters per livestream, 1h livestream -> 10-15 chapters

export class BaseChapterizationService {
   protected livestreamRepo: ILivestreamFunctionsRepository

   constructor(livestreamRepo: ILivestreamFunctionsRepository) {
      this.livestreamRepo = livestreamRepo
   }

   protected async markChapterizationCompleted(
      livestreamId: string,
      result: IChapterizationResult,
      transcriptionFilePath: string
   ): Promise<void> {
      return this.livestreamRepo.updateChapterizationStatus(livestreamId, {
         state: "chapterization-completed",
         documentType: "chapterizationStatus",
         completedAt: Timestamp.now(),
         chaptersCount: result.chapters.length,
         firstChapter: result.chapters[0],
         transcriptionFilePath,
         metadata: result.metadata,
      })
   }

   protected async markChapterizationFailedWithRetry(
      livestreamId: string,
      error: unknown,
      retryCount: number,
      transcriptionFilePath: string,
      nextRetryAt: Timestamp
   ): Promise<void> {
      return this.livestreamRepo.updateChapterizationStatus(livestreamId, {
         state: "chapterization-failed",
         documentType: "chapterizationStatus",
         errorMessage: getErrorMessage(error),
         failedAt: Timestamp.now(),
         transcriptionFilePath,
         retryCount,
         nextRetryAt,
      })
   }

   protected async markChapterizationPermanentlyFailed(
      livestreamId: string,
      error: unknown,
      retryCount: number,
      transcriptionFilePath: string
   ): Promise<void> {
      return this.livestreamRepo.updateChapterizationStatus(livestreamId, {
         state: "chapterization-failed",
         errorMessage: `Failed after max retries reached: ${getErrorMessage(
            error
         )}`,
         failedAt: Timestamp.now(),
         documentType: "chapterizationStatus",
         transcriptionFilePath,
         retryCount,
         nextRetryAt: null,
      })
   }

   /**
    * Generic method to batch write items to a Firestore subcollection
    * @param livestreamId - The ID of the livestream
    * @param items - Array of items to write
    * @param collectionName - Name of the subcollection (e.g., "chapters", "generatedQuestions")
    * @param transform - Function to transform each item into the Firestore document format
    * @param itemType - Type name for logging (e.g., "chapter", "question")
    */
   private async batchWriteToSubcollection<T, R>(
      livestreamId: string,
      items: T[],
      collectionName: string,
      transform: (
         item: T,
         index: number,
         docRef: FirebaseFirestore.DocumentReference
      ) => R,
      itemType: string
   ): Promise<void> {
      const bulkWriter: BulkWriter = firestore.bulkWriter()
      let writeCount = 0

      try {
         for (const [index, item] of items.entries()) {
            const docRef = firestore
               .collection("livestreams")
               .doc(livestreamId)
               .collection(collectionName)
               .doc()

            const transformedItem = transform(item, index, docRef)

            bulkWriter
               .set(docRef, transformedItem)
               .then(() => writeCount++)
               .catch((error) => {
                  logger.error(`bulkWriter.set failed for ${itemType}`, {
                     livestreamId,
                     index,
                     error,
                     errorMessage: getErrorMessage(error),
                  })
               })

            // Flush periodically to avoid memory issues
            if ((index + 1) % WRITE_BATCH === 0) {
               await bulkWriter.flush()
               logger.info("Flushed bulkWriter batch", {
                  livestreamId,
                  collectionName,
                  batchNumber: Math.floor((index + 1) / WRITE_BATCH),
               })
            }
         }

         // Final flush for any remaining writes
         await bulkWriter.flush()

         // Close bulkWriter to ensure all writes are committed
         await bulkWriter.close()

         logger.info("Items saved to Firestore successfully", {
            livestreamId,
            collectionName,
            itemsCount: items.length,
            writeCount,
         })
      } catch (error) {
         logger.error(`Failed to save ${itemType}s to Firestore`, {
            livestreamId,
            collectionName,
            error,
            errorMessage: getErrorMessage(error),
         })
         throw error
      }
   }

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

      await this.batchWriteToSubcollection<Chapter, LivestreamChapter>(
         livestreamId,
         chapters,
         "chapters",
         (chapter, index, docRef) => {
            const livestreamChapter: LivestreamChapter = {
               ...chapter,
               documentType: "livestreamChapter",
               type: "generated",
               id: docRef.id,
               livestreamId,
               createdAt: Timestamp.now(),
               chapterIndex: index,
            }
            return livestreamChapter
         },
         "chapter"
      )
   }
}
