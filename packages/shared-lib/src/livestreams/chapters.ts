import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"
import { Chapter } from "./livestreams"

export type LLMProviders = "anthropic"

type BaseChapterizationStatus = {
   transcriptionFilePath: string
}

type RunningState = {
   state: "chapterizing"
   startedAt: Timestamp
}

type CompletedState = {
   state: "chapterization-completed"
   chaptersCount: number
   firstChapter: Chapter
}

type FailedState = {
   state: "chapterization-failed"
   errorMessage: string
   failedAt: Timestamp
   retryCount: number
   nextRetryAt?: Timestamp
}

export type ChapterizationStatus = BaseChapterizationStatus &
   (RunningState | CompletedState | FailedState)

/**
 * Collection: /livestreamChapters
 * Document in the livestreamChapters collection track the status of
 * chapter generation for a livestream.
 */
export interface LivestreamChapter extends Identifiable {
   /**
    * The identifiable.id could be the livestreamId or the recordingId as well
    */
   livestreamId: string
   chapterProvider: LLMProviders
   /**
    * Current status of the transcription/chapter generation process
    */
   status: ChapterizationStatus

   /**
    * Timestamp when the document was last updated
    */
   updatedAt: Timestamp

   /**
    * Timestamp when the document was created
    */
   createdAt: Timestamp
}
