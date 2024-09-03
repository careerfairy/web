import {
   LivestreamEvent,
   pickPublicDataFromLivestream,
} from "@careerfairy/shared-lib/livestreams"
import {
   LivestreamTranscript,
   LivestreamTranscriptSegment,
} from "@careerfairy/shared-lib/livestreams/ai"
import { TranscriptionSegment } from "@careerfairy/shared-lib/utils/transcription"
import { logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import { firestore, Timestamp } from "../../api/firestoreAdmin"
import { livestreamsRepo } from "../../api/repositories"
import { createGenericConverter } from "../../util/firestore-admin"
import { createLivestreamSpeechContexts, transcribeLongAudio } from "./util"

const TIMEOUT_SECONDS = 60 * 60 // 1 hour

/**
 * Generates a transcript for a live stream using Google Cloud Speech-to-Text.
 *
 * **Cost Estimation:**
 * - $0.016 per minute for real-time processing.
 * - Example: 1-hour stream (60 minutes) costs approximately $0.96.
 *
 * @param {object} context - Event context for the function invocation.
 * @returns {void}
 */
export const generateLiveStreamTranscript = onRequest(
   {
      timeoutSeconds: TIMEOUT_SECONDS,
   },
   async (req, res) => {
      const livestreamId = req.query.livestreamId

      if (req.method !== "GET") {
         res.status(400).send("Only GET requests are allowed")
         return
      }

      if (!livestreamId || typeof livestreamId !== "string") {
         res.status(400).send("livestreamId is required as a query parameter")
         return
      }

      const livestream = await livestreamsRepo.getById(livestreamId)

      if (!livestream) {
         res.status(404).send("Live stream not found")
         return
      }

      const { isProcessing, minutesElapsed } = await checkIsProcessing(
         livestream.id
      )

      if (isProcessing) {
         res.status(200).send(
            `Transcription for live stream ${livestream.id} has been in progress for ${minutesElapsed} minutes. Please wait for it to complete.`
         )
         return
      }

      try {
         await updateTranscriptStatus(livestream, "processing")

         const processingPromise = processAndStoreTranscription(livestream)
         const timeoutPromise = createTimeout((TIMEOUT_SECONDS - 30) * 1000) // Manually throw an error 30 seconds before the timeout so we can update the status to error

         /**
          * Wait for the transcription to complete or for the timeout to occur.
          * If the timeout occurs, the transcription will be marked as failed.
          */
         const result = await Promise.race([processingPromise, timeoutPromise])

         res.status(200).send(result)
      } catch (error) {
         logger.error("Error in generateLiveStreamTranscript:", error)
         await updateTranscriptStatus(livestream, "error")
         res.status(500).send("An error occurred while processing the request")
      }
   }
)

async function processAndStoreTranscription(
   livestream: LivestreamEvent
): Promise<string> {
   const gcsUri = `gs://careerfairy-e1fd9.appspot.com/live-stream-audio-recordings/${livestream.id}.wav`

   // Create speech contexts based on livestream information
   const speechContexts = createLivestreamSpeechContexts(livestream)

   const transcriptionSegments = await transcribeLongAudio(gcsUri, {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      audioChannelCount: 1,
      languageCode: getLanguageCode(livestream.language?.code),
      alternativeLanguageCodes: ["en-GB", "de-DE", "fr-FR", "nl-NL"],
      model: "latest_long", // Best model for long audio
      diarizationConfig: {
         enableSpeakerDiarization: true,
      },
      speechContexts: speechContexts,
      enableSpeakerDiarization: true,
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true,
      enableWordConfidence: true,
   })

   await storeLivestreamTranscript(livestream, transcriptionSegments)

   return "Transcription generated and stored successfully"
}

/**
 * Checks if the transcription for a given live stream is currently processing.
 * @param livestreamId The ID of the live stream to check.
 * @returns A promise that resolves to an object containing the isProcessing flag and the minutes elapsed since the last status update.
 */
async function checkIsProcessing(livestreamId: string) {
   const transcriptDoc = await firestore
      .collection("livestreamTranscripts")
      .withConverter<LivestreamTranscript>(createGenericConverter())
      .doc(livestreamId)
      .get()

   if (!transcriptDoc.exists) {
      return {
         isProcessing: false,
         minutesElapsed: 0,
      }
   }

   const transcriptData = transcriptDoc.data()

   const minutesElapsed = Math.floor(
      (Timestamp.now().toDate().getTime() -
         (transcriptData.statusUpdatedAt?.toDate().getTime() || 0)) /
         60000
   )

   return {
      isProcessing:
         minutesElapsed < 60 && transcriptData.status === "processing",
      minutesElapsed,
   }
}

async function updateTranscriptStatus(
   livestream: LivestreamEvent,
   status: "processing" | "complete" | "error"
) {
   logger.info(
      `Updating livestream ${livestream.id} transcript status to: ${status}`
   )
   return firestore
      .collection("livestreamTranscripts")
      .withConverter<LivestreamTranscript>(createGenericConverter())
      .doc(livestream.id)
      .set(
         {
            status,
            statusUpdatedAt: Timestamp.now(),
            livestream: pickPublicDataFromLivestream(livestream),
         },
         { merge: true }
      )
}

async function storeLivestreamTranscript(
   livestream: LivestreamEvent,
   transcriptSegments: TranscriptionSegment[]
) {
   const bulkWriter = firestore.bulkWriter()

   const mainDocRef = firestore
      .collection("livestreamTranscripts")
      .withConverter<LivestreamTranscript>(createGenericConverter())
      .doc(livestream.id)

   // Create main document
   void bulkWriter.set(
      mainDocRef,
      {
         livestream: pickPublicDataFromLivestream(livestream),
         transcriptUpdatedAt: Timestamp.now(),
         status: "complete",
         statusUpdatedAt: Timestamp.now(),
         totalSegments: transcriptSegments.length,
         transcript: transcriptSegments
            .map((segment) => segment.transcript)
            .join("\n"),
      },
      { merge: true }
   )

   // Delete existing segments sub-collection
   const segmentsCollectionRef = mainDocRef.collection(
      "livestreamTranscriptSegments"
   )
   const existingSegments = await segmentsCollectionRef.get()
   existingSegments.docs.forEach((doc) => {
      void bulkWriter.delete(doc.ref)
   })

   // Create segments sub-collection
   transcriptSegments.forEach((segmentChunk, index) => {
      const chunkDocRef = mainDocRef
         .collection("livestreamTranscriptSegments")
         .withConverter<LivestreamTranscriptSegment>(createGenericConverter())
         .doc(`segment_${index}`)

      void bulkWriter.set(chunkDocRef, {
         ...segmentChunk,
         id: chunkDocRef.id,
         documentType: "livestreamTranscriptSegment",
      })
   })

   // Commit the bulk write operation
   await bulkWriter.close()

   return "Transcription chunks stored successfully"
}

function getLanguageCode(language: string) {
   const code = language.toLowerCase() || "en"

   if (code === "nl") return "nl-NL"
   if (code === "de") return "de-DE"
   if (code === "fr") return "fr-FR"
   if (code === "es") return "es-ES"

   return "en-GB"
}

function createTimeout(ms: number): Promise<never> {
   return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Function timed out")), ms)
   )
}
