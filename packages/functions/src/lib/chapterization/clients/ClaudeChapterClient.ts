import { AnthropicProviderOptions, createAnthropic } from "@ai-sdk/anthropic"
import { LLMProviders } from "@careerfairy/shared-lib/livestreams/chapters"
import { LanguageModel, generateObject } from "ai"
import { logger } from "firebase-functions/v2"
import { ITranscriptionResult } from "src/lib/transcription/types"
import { z } from "zod"
import { ChaptersSchema } from "../../../lib/transcription/schemas"
import { getErrorMessage } from "../../../lib/transcription/utils"
import { isLocalEnvironment, isTestEnvironment } from "../../../util"
import {
   IChapterizationClient,
   IChapterizationResult,
   getChapterizationClientStub,
} from "../types"

export class ClaudeChapterClient implements IChapterizationClient {
   provider: LLMProviders = "anthropic"
   private readonly model: LanguageModel

   private constructor(private readonly apiKey: string) {
      const anthropicModel = createAnthropic({ apiKey: this.apiKey })
      this.model = anthropicModel("claude-sonnet-4-5")
   }

   static create(): IChapterizationClient {
      if (isTestEnvironment()) {
         logger.info("Using Claude client mock")
         return getChapterizationClientStub() as IChapterizationClient
      }

      let apiKey = process.env.ANTHROPIC_API_KEY

      if (isLocalEnvironment()) {
         apiKey = process.env.DEV_ANTHROPIC_API_KEY
         if (!apiKey) {
            throw new Error(
               "DEV_ANTHROPIC_API_KEY environment variable is not set"
            )
         }
      }

      if (!apiKey) {
         throw new Error("ANTHROPIC_API_KEY environment variable is not set")
      }

      return new ClaudeChapterClient(apiKey)
   }

   async generateChapters(
      transcription: ITranscriptionResult,
      retries: number
   ): Promise<IChapterizationResult> {
      logger.info("Starting chapterization", {
         duration: transcription.duration,
         paragraphsCount: transcription.paragraphs.length,
         provider: this.provider,
      })

      try {
         const prompt = this.buildPrompt(transcription)
         const system = this.buildSystemPrompt(transcription)

         // Claude's tool format requires the root schema to be an object, not an array
         // So we wrap the array in an object
         const ClaudeChaptersSchema = z.object({
            chapters: ChaptersSchema,
         })

         const { object, usage, providerMetadata } = await generateObject({
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

         logger.info("Chapterization successful", {
            chaptersCount: object.chapters.length,
            provider: this.provider,
         })

         return {
            chapters: object.chapters,
            metadata: {
               providerData: providerMetadata,
               tokens: {
                  input: usage.inputTokens ?? 0,
                  output: usage.outputTokens ?? 0,
                  total: usage.totalTokens ?? 0,
                  reasoning: usage.reasoningTokens ?? 0,
                  cachedInput: usage.cachedInputTokens ?? 0,
               },
            },
         }
      } catch (error) {
         logger.error("Chapterization failed", {
            error,
            errorMessage: getErrorMessage(error),
            provider: this.provider,
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
