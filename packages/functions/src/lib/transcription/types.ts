import { ASRProviders } from "@careerfairy/shared-lib/livestreams/transcriptions"

export type ParagraphSentence = {
   text: string
   start: number
   end: number
}

export type TranscriptionParagraph = {
   start: number
   end: number
   sentences: ParagraphSentence[]
}

export interface ITranscriptionResult {
   transcript: string
   language: string
   languageConfidence: number
   confidence: number
   duration: number
   paragraphs: TranscriptionParagraph[]
}

export interface ITranscriptionClient {
   readonly provider: ASRProviders
   /**
    * Generates a structured transcription, from  an audio/video file, while
    * automatically detecting the language.
    * @param audioUrl - The URL of the audio file to transcribe
    * @returns The transcription result
    */
   transcribeAudio(audioUrl: string): Promise<ITranscriptionResult>
}
