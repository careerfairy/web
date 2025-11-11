import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"

/**
 * Collection: /livestreamTranscriptionsGenerationStatus
 * Document in the livestreamTranscriptionsGenerationStatus collection track the status of
 * transcription and chapter generation for a livestream (whole process end to end, not just transcription).
 * Status is stored in subcollection: /livestreamTranscriptionsGenerationStatus/{livestreamId}/status/{statusId}
 */
export interface LivestreamTranscriptionsGenerationStatus extends Identifiable {
   /**
    * The identifiable.id could be the livestreamId or the recordingId as well
    */
   livestreamId: string // Could also be just the recording link, id

   /**
    * Having providers listed is not very useful, only for quick view
    */
   transcriptionProvider: ASRProviders

   /**
    * Latest status for quick access (denormalized from status subcollection)
    */
   lastStatus?: TranscriptionStatus

   /**
    * Timestamp when the document was last updated
    */
   updatedAt: Timestamp

   /**
    * Timestamp when the document was created
    */
   createdAt: Timestamp
}

/**
 * Metadata for transcription results
 */
export type TranscriptMetadata = {
   language?: string
   languageConfidence?: number
   recordingId: string
   /**
    * The full path of the resulting document, only provided when state is complete.
    */
   transcriptionFilePath?: string
}

/**
 * Automatic speech recognition providers
 */
export type ASRProviders = "deepgram"

/**
 * Base status type for all transcription status variants
 * Subcollection path: /livestreamTranscriptionsGenerationStatus/{livestreamId}/status/{statusId}
 */
type BaseTranscriptionStatus = {
   documentType: "transcriptionStatus"
}

/**
 * Running state for transcription
 * Subcollection path: /livestreamTranscriptionsGenerationStatus/{livestreamId}/status/{statusId}
 */
export type TranscriptionRunningState = {
   state: "transcribing"
   startedAt: Timestamp
}

/**
 * Completed state for transcription
 * Subcollection path: /livestreamTranscriptionsGenerationStatus/{livestreamId}/status/{statusId}
 */
export type TranscriptionCompletedState = {
   state: "transcription-completed"
   completedAt: Timestamp
   confidenceAvg: number
   transcriptText: string // minimal denormalized result for quick reads
   metadata: TranscriptMetadata
}

/**
 * Failed state for transcription
 * Subcollection path: /livestreamTranscriptionsGenerationStatus/{livestreamId}/status/{statusId}
 */
export type TranscriptionFailedState = {
   state: "transcription-failed"
   metadata: TranscriptMetadata
   errorMessage: string
   failedAt: Timestamp
   retryCount: number
   nextRetryAt?: Timestamp
}

/**
 * Union type representing all possible transcription states
 * Subcollection path: /livestreamTranscriptionsGenerationStatus/{livestreamId}/status/{statusId}
 */
export type TranscriptionStatus = BaseTranscriptionStatus &
   (
      | TranscriptionRunningState
      | TranscriptionCompletedState
      | TranscriptionFailedState
   )
