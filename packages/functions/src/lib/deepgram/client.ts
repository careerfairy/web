import type {
   DeepgramClient as DeepgramSDKClient,
   PrerecordedSchema,
   SyncPrerecordedResponse,
   UrlSource,
} from "@deepgram/sdk"
import { createClient } from "@deepgram/sdk"
import { logger } from "firebase-functions/v2"
import { ProcessedTranscription } from "./types"

/**
 * Client for interacting with the Deepgram API using the official SDK
 */
export class DeepgramClient {
   private readonly client: DeepgramSDKClient

   constructor() {
      const apiKey = process.env.DEEPGRAM_API_KEY

      if (!apiKey) {
         throw new Error("DEEPGRAM_API_KEY environment variable is not set")
      }

      this.client = createClient(apiKey)
   }

   /**
    * Transcribe audio from a URL using Deepgram API
    *
    * @param audioUrl - URL of the audio/video file to transcribe
    * @param options - Optional transcription parameters
    * @returns Processed transcription result
    */
   async transcribeAudio(
      audioUrl: string,
      options?: Partial<PrerecordedSchema>
   ): Promise<ProcessedTranscription> {
      logger.info("Starting Deepgram transcription", { audioUrl })

      const defaultOptions: PrerecordedSchema = {
         punctuate: true,
         utterances: true,
         paragraphs: true,
         detect_language: true,
         ...options,
      }

      const source: UrlSource = {
         url: audioUrl,
      }

      try {
         const { result, error } =
            await this.client.listen.prerecorded.transcribeUrl(
               source,
               defaultOptions
            )

         if (error) {
            logger.error("Deepgram transcription returned error", {
               error,
               audioUrl,
            })
            throw new Error(`Deepgram API error: ${JSON.stringify(error)}`)
         }

         if (!result) {
            throw new Error("Deepgram API returned no result")
         }

         logger.info("Deepgram transcription successful", {
            requestId: result.metadata?.request_id,
            duration: result.metadata?.duration,
            channels: result.metadata?.channels,
         })

         return this.processResponse(result)
      } catch (error) {
         logger.error("Deepgram transcription failed", {
            error,
            audioUrl,
            errorMessage:
               error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
         })
         throw error
      }
   }

   /**
    * Process the raw Deepgram response into a more usable format
    *
    * @param response - Raw Deepgram API response from SDK
    * @returns Processed transcription result
    */
   private processResponse(
      response: SyncPrerecordedResponse
   ): ProcessedTranscription {
      const channel = response.results?.channels?.[0]
      if (!channel) {
         throw new Error("No channels found in Deepgram response")
      }

      const alternative = channel.alternatives?.[0]
      if (!alternative) {
         throw new Error("No alternatives found in Deepgram response")
      }

      // Extract transcript
      const transcript = alternative.transcript || ""

      // Calculate average confidence
      const words = alternative.words || []
      const confidence =
         words.length > 0
            ? words.reduce((sum, word) => sum + (word.confidence || 0), 0) /
              words.length
            : alternative.confidence || 0

      // Extract utterances
      const utterances = response.results?.utterances || []

      // Extract paragraphs
      const paragraphs = alternative.paragraphs?.paragraphs || []

      // Get detected language and confidence
      const language = channel.detected_language || "en"
      const languageConfidence = channel.language_confidence || 0

      // Get duration from metadata
      const duration = response.metadata?.duration || 0

      return {
         transcript,
         language,
         languageConfidence,
         confidence,
         duration,
         utterances,
         paragraphs,
         rawResponse: response,
      }
   }
}
