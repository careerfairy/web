import { Chapter } from "@careerfairy/shared-lib/livestreams"
import { LLMProviders } from "@careerfairy/shared-lib/livestreams/transcriptions"
import { ITranscriptionResult } from "../transcription/types"

export interface IChapterizationResult {
   chapters: Chapter[]
}

export interface IChapterizationClient {
   readonly provider: LLMProviders
   /**
    * Generates chapters from a transcription result
    * @param transcriptionResult - The transcription result to chapterize
    * @returns The chapterization result with structured chapters
    */
   generateChapters(
      transcription: ITranscriptionResult,
      retries: number
   ): Promise<IChapterizationResult>
}
