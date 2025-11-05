import { Chapter } from "@careerfairy/shared-lib/livestreams"
import {
   ChapterizationMetadata,
   LLMProviders,
} from "@careerfairy/shared-lib/livestreams/chapters"
import { ITranscriptionResult } from "../transcription/types"

export interface IChapterizationResult {
   chapters: Chapter[]
   metadata: ChapterizationMetadata
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

export const getChapterizationClientStub =
   (): Partial<IChapterizationClient> => ({
      provider: "anthropic",
      generateChapters: async () =>
         Promise.resolve({} as IChapterizationResult),
   })
