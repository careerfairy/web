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
   statusUpdatedAt: Timestamp
   livestream: LivestreamEventPublicData
   totalSegments: number
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
