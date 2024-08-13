import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"
import { TranscriptionSegment } from "../utils/transcription"
import { LivestreamEventPublicData } from "./livestreams"

/**
 * A document containing the full transcript of a live stream
 * Document path: livestreamTranscripts/{livestreamId}
 */
export interface LivestreamTranscript extends Identifiable {
   /** The full transcript of the live stream */
   transcript: string
   transcriptUpdatedAt: Timestamp
   status: "processing" | "complete" | "error"
   error?: string
   statusUpdatedAt: Timestamp
   livestream: LivestreamEventPublicData
   totalSegments: number
   numberOfWords: number
   numberOfCharacters: number
}

/**
 * A breakdown of a segment of the transcript eg. a paragraph or a sentence containing timestamps, speakerTags, and the text of the segment
 * Document path: livestreamTranscripts/{livestreamId}/livestreamTranscriptSegments/{segment_${index}}
 */
export interface LivestreamTranscriptSegment
   extends Identifiable,
      TranscriptionSegment {
   documentType: "livestreamTranscriptSegment"
}

/**
 * The status of the audio processing converting the livestream recording to a WAV file
 */
export enum AudioProcessingStatus {
   /**
    * The default status, not yet processed
    */
   PENDING = "pending",
   /**
    * The audio processing was successful
    */
   PROCESSED = "processed",
   /**
    * The audio processing was skipped, reasons: could not find the recording in s3
    */
   SKIPPED = "skipped",
   /**
    * The audio processing failed
    */
   ERROR = "error",
}
