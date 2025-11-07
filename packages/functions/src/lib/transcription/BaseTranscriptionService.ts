import { Timestamp } from "../../api/firestoreAdmin"
import { ILivestreamFunctionsRepository } from "../LivestreamFunctionsRepository"
import { ITranscriptionResult } from "./types"
import { getErrorMessage } from "./utils"

export class BaseTranscriptionService {
   protected livestreamRepo: ILivestreamFunctionsRepository

   constructor(livestreamRepo: ILivestreamFunctionsRepository) {
      this.livestreamRepo = livestreamRepo
   }

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
}
