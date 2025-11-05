import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"
import { Chapter } from "./livestreams"

export type LLMProviders = "anthropic"

export type ChapterizationMetadata = {
   providerData: Record<string, unknown>
   // The usage data for the chapterization in terms of tokens
   tokens: {
      input: number
      output: number
      total: number
      reasoning: number
      cachedInput: number
   }
}

/**
 * Base status type for all chapterization status variants
 * Subcollection path: /livestreamChaptersGenerationStatus/{livestreamId}/status/{statusId}
 */
type BaseChapterizationStatus = {
   documentType: "chapterizationStatus"
   transcriptionFilePath: string
}

/**
 * Running state for chapterization
 * Subcollection path: /livestreamChaptersGenerationStatus/{livestreamId}/status/{statusId}
 */
export type ChapterizationRunningState = {
   state: "chapterizing"
   startedAt: Timestamp
}

/**
 * Completed state for chapterization
 * Subcollection path: /livestreamChaptersGenerationStatus/{livestreamId}/status/{statusId}
 */
export type ChapterizationCompletedState = {
   state: "chapterization-completed"
   completedAt: Timestamp
   chaptersCount: number
   firstChapter: Chapter
   metadata: ChapterizationMetadata
}

/**
 * Failed state for chapterization
 * Subcollection path: /livestreamChaptersGenerationStatus/{livestreamId}/status/{statusId}
 */
export type ChapterizationFailedState = {
   state: "chapterization-failed"
   errorMessage: string
   failedAt: Timestamp
   retryCount: number
   nextRetryAt?: Timestamp
}

/**
 * Union type representing all possible chapterization states
 * Subcollection path: /livestreamChaptersGenerationStatus/{livestreamId}/status/{statusId}
 */
export type ChapterizationStatus = BaseChapterizationStatus &
   (
      | ChapterizationRunningState
      | ChapterizationCompletedState
      | ChapterizationFailedState
   )

/**
 * Collection: /livestreamChaptersGenerationStatus
 * Document in the livestreamChaptersGenerationStatus collection track the status of
 * chapter generation for a livestream.
 * Status is stored in subcollection: /livestreamChaptersGenerationStatus/{livestreamId}/status/{statusId}
 */
export interface LivestreamChaptersGenerationStatus extends Identifiable {
   /**
    * The identifiable.id could be the livestreamId or the recordingId as well
    */
   livestreamId: string
   chapterProvider: LLMProviders

   /**
    * Latest status for quick access (denormalized from status subcollection)
    */
   lastStatus?: ChapterizationStatus

   /**
    * Timestamp when the document was last updated
    */
   updatedAt: Timestamp

   /**
    * Timestamp when the document was created
    */
   createdAt: Timestamp
}
