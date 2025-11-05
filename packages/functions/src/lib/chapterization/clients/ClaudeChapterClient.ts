import { AnthropicProviderOptions, anthropic } from "@ai-sdk/anthropic"
import { LLMProviders } from "@careerfairy/shared-lib/livestreams/transcriptions"
import { LanguageModel, generateObject } from "ai"
import { logger } from "firebase-functions/v2"
import { ITranscriptionResult } from "src/lib/transcription/types"
import { z } from "zod"
import { ChaptersSchema } from "../../../lib/transcription/schemas"
import { getErrorMessage } from "../../../lib/transcription/utils"
import { IChapterizationClient, IChapterizationResult } from "../types"

export class ClaudeChapterClient implements IChapterizationClient {
   provider: LLMProviders = "anthropic" // Using "openai" as LLMProviders type, but actually using Claude
   private readonly model: LanguageModel

   constructor() {
      const apiKey = process.env.ANTHROPIC_API_KEY

      if (!apiKey) {
         throw new Error("ANTHROPIC_API_KEY environment variable is not set")
      }

      this.model = anthropic("claude-sonnet-4-5")
   }

   async generateChapters(
      transcription: ITranscriptionResult,
      retries: number
   ): Promise<IChapterizationResult> {
      logger.info("Starting Claude chapterization", {
         duration: transcription.duration,
         paragraphsCount: transcription.paragraphs.length,
      })

      try {
         const prompt = this.buildPrompt(transcription)
         const system = this.buildSystemPrompt(transcription)

         // Claude's tool format requires the root schema to be an object, not an array
         // So we wrap the array in an object
         const ClaudeChaptersSchema = z.object({
            chapters: ChaptersSchema,
         })

         const { object } = await generateObject({
            model: this.model,
            schema: ClaudeChaptersSchema,
            providerOptions: {
               thinking: {
                  type: "enabled",
               },
            } satisfies AnthropicProviderOptions,
            system,
            prompt,
            maxRetries: retries,
         })

         logger.info("Claude chapterization successful", {
            chaptersCount: object.chapters.length,
         })

         return {
            chapters: object.chapters,
         }
      } catch (error) {
         logger.error("Claude chapterization failed", {
            error,
            errorMessage: getErrorMessage(error),
         })
         throw error
      }
   }

   private buildSystemPrompt(transcription: ITranscriptionResult): string {
      return `
            You are a professional content editor tasked with creating well-structured chapters from a 
            live stream transcription in ${transcription.language} (ISO 639-1 code) language.
        `
   }
   /**
    * Build the prompt for chapter generation
    */
   private buildPrompt(transcription: ITranscriptionResult): string {
      return `
            Generate chapters, by grouping related transcription content together logically taking into
            consideration the following criteria:
                - Topic changes
                - Transcription language - ${
                   transcription.language
                } (ISO 639-1 code)
                - Transitions between topics
                - Natural breaks in the conversation
                - Significant content changes
                - Important information
                - Key points
                - Main ideas
                - Important details
                - Topic duration

            Analyze the following transcription and create meaningful chapters that:
            1. Is describe in the same language as the transcription - ${
               transcription.language
            } (ISO 639-1 code)
            2. Group related content together logically
            3. Have clear, descriptive titles
            4. Include accurate start and end times in seconds
            5. Provide a brief summary of each chapter

            Transcription
            Duration: ${transcription.duration} seconds
            Language: ${transcription.language} (ISO 639-1 code)
            Paragraphs: ${transcription.paragraphs.length}

            Transcript with start and end times at the beginning of each paragraph:
            ${transcription.paragraphs
               .map(
                  (paragraph) =>
                     `${paragraph.start} - ${
                        paragraph.end
                     }: ${paragraph.sentences
                        .map((sentence) => sentence.text)
                        .join(" ")}`
               )
               .join("\n\t")}


            Return the chapters as an array, ensuring:
            - Chapters are describe in the same language as the transcription - ${
               transcription.language
            } (ISO 639-1 code)
            - startSec and endSec are accurate based on the transcription timestamps
            - Chapters do not overlap
            - Chapters cover the entire duration
            - Titles are descriptive and informative`
   }
}
