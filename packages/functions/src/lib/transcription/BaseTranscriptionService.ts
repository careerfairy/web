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
      return this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
         state: "transcription-completed",
         documentType: "transcriptionStatus",
         completedAt: Timestamp.now(),
         transcriptText: result.transcript.substring(0, 500),
         confidenceAvg: result.confidence,
         metadata: {
            language: result.language,
            languageConfidence: result.languageConfidence,
            recordingId: recordingUrl,
            transcriptionFilePath: gcsPath,
         },
      })
   }

   protected async markTranscriptionFailedWithRetry(
      livestreamId: string,
      error: unknown,
      retryCount: number,
      recordingUrl: string,
      nextRetryAt: Timestamp
   ): Promise<void> {
      return this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
         state: "transcription-failed",
         documentType: "transcriptionStatus",
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
      return this.livestreamRepo.updateTranscriptionStatus(livestreamId, {
         state: "transcription-failed",
         documentType: "transcriptionStatus",
         errorMessage: `Max retries reached: ${getErrorMessage(error)}`,
         failedAt: Timestamp.now(),
         retryCount,
         metadata: {
            recordingId: recordingUrl,
         },
      })
   }
}
