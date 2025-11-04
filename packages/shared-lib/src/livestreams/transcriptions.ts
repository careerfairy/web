import firebase from "firebase/compat/app"
import { Identifiable } from "../commonTypes"
import Timestamp = firebase.firestore.Timestamp

// Collection: /livestreamTranscriptions

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
 * Metadata for chapter generation results
 */
export type ChaptersMetadata = {
   transcriptionFilePath: string
   /**
    * Id of the result document stored in Firestore, only provided when state is complete.
    */
   chaptersCount: number
}

/**
 * Base state for running processes
 */
type BaseRunningState = {
   startedAt: Timestamp
}

/**
 * State when transcription is in progress
 */
type TranscriptionRunningState = {
   state: "transcribing"
   // We might want to add transcription specific metadata here, such as
   // requestId: string // Deepgram requestId, Google operation name, etc. not needed for now as there is no polling.
}

/**
 * State when chapter generation is in progress
 */
type TranscriptionChapterRunningState = {
   state: "generating-chapter"
   // We might want to add chapter specific metadata here (none needed for now)
}

/**
 * Combined running state
 */
type RunningState = BaseRunningState &
   (TranscriptionRunningState | TranscriptionChapterRunningState)

/**
 * State when transcription or chapter generation is completed
 */
type CompletedState = {
   state: "completed"
   completedAt: Timestamp
   transcriptText: string // minimal denormalized result for quick reads
   confidenceAvg: number
   metadata: TranscriptMetadata | ChaptersMetadata
}

type TranscriptionFailedState = {
   state: "transcription-failed"
   metadata: TranscriptMetadata
}

type ChapterizationFailedState = {
   state: "chapterization-failed"
   metadata: ChaptersMetadata
}

type BaseFailedState = {
   errorMessage: string
   failedAt: Timestamp
   retryCount: number
   nextRetryAt?: Timestamp
}
/**
 * State when transcription or chapter generation has failed
 */
type FailedState = BaseFailedState &
   (TranscriptionFailedState | ChapterizationFailedState)

/**
 * State when process is cancelled
 */
type CancelledState = {
   state: "cancelled"
   cancelledAt: Timestamp
   cancelledReason: string
}

/**
 * Union type representing all possible transcription states
 */
export type TranscriptionStatus =
   | RunningState
   | CompletedState
   | FailedState
   | CancelledState

/**
 * Automatic speech recognition providers
 */
export type ASRProviders = "google" | "deepgram" | "aws"

/**
 * Language model providers
 */
export type LLMProviders = "openai" | "google" | "whisper"

/**
 * Document in the livestreamTranscriptions collection
 * Tracks the status of transcription and chapter generation for a livestream
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
    * Provider used for chapter generation
    */
   chapterProvider: LLMProviders

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
