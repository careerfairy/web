import type { SyncPrerecordedResponse } from "@deepgram/sdk"

/**
 * Utterance type extracted from Deepgram SDK response
 * Represents a speaker-separated segment in the transcription
 */
export type DeepgramUtterance = NonNullable<
   SyncPrerecordedResponse["results"]["utterances"]
>[number]

/**
 * Paragraph type extracted from Deepgram SDK response
 * Represents a paragraph segment in the transcription
 */
export type DeepgramParagraph = NonNullable<
   NonNullable<
      NonNullable<
         SyncPrerecordedResponse["results"]["channels"]
      >[number]["alternatives"]
   >[number]["paragraphs"]
>["paragraphs"][number]

/**
 * Processed transcription result for internal use
 *
 * This is our custom format that wraps the Deepgram SDK response
 * with commonly accessed fields for easier consumption
 */
export interface ProcessedTranscription {
   /**
    * Full transcript text
    */
   transcript: string

   /**
    * Detected or specified language code (e.g., 'en', 'es', 'fr')
    */
   language: string

   /**
    * Confidence score for the detected language (0-1)
    */
   languageConfidence: number

   /**
    * Average confidence score across all words (0-1)
    */
   confidence: number

   /**
    * Duration of the audio/video in seconds
    */
   duration: number

   /**
    * Utterances (speaker-separated segments) from Deepgram SDK
    */
   utterances: DeepgramUtterance[]

   /**
    * Paragraphs from Deepgram SDK
    */
   paragraphs: DeepgramParagraph[]

   /**
    * Raw Deepgram SDK response for full access to all data
    */
   rawResponse: SyncPrerecordedResponse
}
