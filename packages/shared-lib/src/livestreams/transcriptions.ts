import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"

/**
 * Collection: /livestreamTranscriptions
 * Document in the livestreamTranscriptions collection track the status of
 * transcription and chapter generation for a livestream (whole process end to end, not just transcription).
 */
export interface LivestreamTranscription extends Identifiable {
   /**
    * The identifiable.id could be the livestreamId or the recordingId as well
    */
   livestreamId: string // Could also be just the recording link, id

   /**
    * Having providers listed is not very useful, only for quick view
    */
   transcriptionProvider: ASRProviders

   /**
    * Current status of the transcription/chapter generation process
    */
   status: TranscriptionStatus

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
 * Union type representing all possible transcription states
 */
export type TranscriptionStatus = RunningState | CompletedState | FailedState

/**
 * Automatic speech recognition providers
 */
export type ASRProviders = "deepgram"

/**
 * Combined running state
 */
type RunningState = {
   state: "transcribing"
   startedAt: Timestamp
}

/**
 * State when transcription or chapter generation is completed
 */
type CompletedState = {
   state: "transcription-completed"
   completedAt: Timestamp
   confidenceAvg: number
   transcriptText: string // minimal denormalized result for quick reads
   metadata: TranscriptMetadata
}

/**
 * State when transcription or chapter generation has failed
 */
type FailedState = {
   state: "transcription-failed"
   metadata: TranscriptMetadata
   errorMessage: string
   failedAt: Timestamp
   retryCount: number
   nextRetryAt?: Timestamp
}
