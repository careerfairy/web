import { ASRProviders } from "@careerfairy/shared-lib/livestreams/transcriptions"
import {
   DeepgramClient,
   PrerecordedSchema,
   SyncPrerecordedResponse,
   UrlSource,
   createClient,
} from "@deepgram/sdk"
import { logger } from "firebase-functions/v2"
import { getErrorMessage } from "../TranscriptionService"
import {
   ITranscriptionClient,
   ITranscriptionResult,
   TranscriptionParagraph,
} from "../types"

export class DeepgramTranscriptionClient implements ITranscriptionClient {
   provider: ASRProviders = "deepgram"
   private readonly client: DeepgramClient

   constructor() {
      const apiKey = process.env.DEEPGRAM_API_KEY

      if (!apiKey) {
         throw new Error("DEEPGRAM_API_KEY environment variable is not set")
      }

      this.client = createClient(apiKey)
   }

   async transcribeAudio(audioUrl: string): Promise<ITranscriptionResult> {
      return this.transcribe(audioUrl, {
         punctuate: true,
         utterances: true,
         paragraphs: true,
         detect_language: true,
      })
   }

   /**
    * Transcribe audio from a URL using Deepgram API
    *
    * @param audioUrl - URL of the audio/video file to transcribe
    * @param options - Optional transcription parameters
    * @returns Processed transcription result
    */
   async transcribe(
      audioUrl: string,
      options?: Partial<PrerecordedSchema>
   ): Promise<ITranscriptionResult> {
      logger.info("Starting Deepgram transcription", { audioUrl })

      const defaultOptions: PrerecordedSchema = {
         punctuate: true,
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
            errorMessage: getErrorMessage(error),
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
   ): ITranscriptionResult {
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

      const confidence = alternative.confidence

      // Extract paragraphs, no need to map here as the SDK already returns ta type
      // that matches our type
      const paragraphs: TranscriptionParagraph[] =
         alternative.paragraphs?.paragraphs || []

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
         paragraphs,
      }
   }
}
