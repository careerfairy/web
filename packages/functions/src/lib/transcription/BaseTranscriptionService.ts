import { Chapter, LivestreamChapter } from "@careerfairy/shared-lib/livestreams"
import { TranscriptionStatus } from "@careerfairy/shared-lib/livestreams/transcriptions"
import { BulkWriter, Timestamp } from "firebase-admin/firestore"
import { logger } from "firebase-functions/v2"
import { firestore } from "../../api/firestoreAdmin"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import { ITranscriptionResult } from "./types"
import { getErrorMessage } from "./utils"

const WRITE_BATCH = 20 // There will hardly more than 40 chapters per livestream

export class BaseTranscriptionService {
   protected livestreamRepo: ILivestreamFunctionsRepository

   constructor(livestreamRepo: ILivestreamFunctionsRepository) {
      this.livestreamRepo = livestreamRepo
   }

   /**
    * Mark transcription as completed with results
    */
   protected async markTranscriptionCompleted(
      livestreamId: string,
      result: ITranscriptionResult,
      recordingUrl: string,
      gcsPath: string
   ): Promise<void> {
      const transcriptText = result.transcript.substring(0, 500)

      await this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
         state: "transcription-completed",
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
   protected async markTranscriptionFailedWithRetry(
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
   protected async markTranscriptionPermanentlyFailed(
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
    * Mark chapterization as completed with results
    */
   protected async markChapterizationCompleted(
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
   protected async markChapterizationPermanentlyFailed(
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
}
