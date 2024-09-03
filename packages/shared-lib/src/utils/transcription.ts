import { Timestamp } from "../firebaseTypes"

/**
 * Represents a segment of a transcription, which could be a sentence, paragraph, or other unit of speech.
 * Each segment contains information about its content, confidence, individual words and timestamps.
 */
export interface TranscriptionSegment {
   /**
    * The zero-based index of this segment within the entire transcription.
    * Useful for maintaining order and referencing specific parts of the transcript.
    */
   segmentIndex: number

   /**
    * The textual content of this segment.
    * May be null or undefined if the segment couldn't be transcribed.
    */
   transcript?: string | null

   /**
    * The overall confidence score for this segment's transcription.
    * Ranges from 0.0 (low confidence) to 1.0 (high confidence).
    * May be null or undefined if confidence couldn't be determined.
    */
   confidence?: number | null

   /**
    * Detailed information about each word in this segment.
    * Includes timing, confidence, and speaker identification data.
    * May be null or undefined if word-level details are not available.
    */
   words?: WordInfo[] | null
}

/**
 * Represents information about a recognized word.
 */
export interface WordInfo {
   /**
    * The word recognized.
    */
   word: string

   /**
    * The start time of this word relative to the beginning of the audio.
    */
   startTime: Timestamp

   /**
    * The end time of this word relative to the beginning of the audio.
    */
   endTime: Timestamp

   /**
    * The confidence estimate between 0.0 and 1.0 for this word.
    */
   confidence: number

   /**
    * A numeric speaker tag assigned to this word.
    */
   speakerTag: number
}
