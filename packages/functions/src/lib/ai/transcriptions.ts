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
import { onDocumentWritten } from "firebase-functions/v2/firestore"
import { onRequest } from "firebase-functions/v2/https"
import { onObjectFinalized } from "firebase-functions/v2/storage"
import { firestore, Timestamp } from "../../api/firestoreAdmin"
import { livestreamsRepo } from "../../api/repositories"
import { ChangeType, getChangeTypeEnum } from "../../util"
import { invokeFirebaseHttpsFunction } from "../../util/axios"
import { createGenericConverter } from "../../util/firestore-admin"
import { transcriptEmbeddingService } from "./embeddings/TranscriptEmbeddingService"
import { createLivestreamSpeechContexts, transcribeLongAudio } from "./util"

const TIMEOUT_SECONDS = 60 * 60 // 1 hour

const BUCKET_NAME = "careerfairy-e1fd9.appspot.com"

export const GENERATE_TRANSCRIPT_FUNCTION_NAME = "generateLiveStreamTranscript"

export const triggerTranscription = onObjectFinalized(
   {
      bucket: BUCKET_NAME,
   },
   async (event) => {
      if (
         !event.data.name.startsWith("live-stream-audio-recordings/") ||
         !event.data.name.endsWith(".wav")
      ) {
         console.log("Skipping file:", event.data.name)
         return
      }

      const fileName = event.data.name
      const livestreamId = fileName
         .replace("live-stream-audio-recordings/", "")
         .replace(".wav", "")

      void invokeFirebaseHttpsFunction(GENERATE_TRANSCRIPT_FUNCTION_NAME, {
         method: "GET",
         params: {
            livestreamId,
         },
         headers: {
            secret: process.env.GENERATE_TRANSCRIPT_SECRET,
         },
      })
   }
)

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
      memory: "2GiB",
   },
   async (req, res) => {
      const livestreamId = req.query.livestreamId
      const secret = req.headers.secret

      if (secret !== process.env.GENERATE_TRANSCRIPT_SECRET) {
         res.status(401).send("Unauthorized")
         return
      }

      if (req.method !== "GET") {
         res.status(400).send("Only GET requests are allowed")
         return
      }

      if (!livestreamId || typeof livestreamId !== "string") {
         res.status(400).send("liveStreamId is required as a query parameter")
         return
      }

      const livestream = await livestreamsRepo.getById(livestreamId)

      if (!livestream) {
         res.status(404).send("Live stream not found")
         return
      }

      const progressObject = {
         progress: 0,
      }

      const { isProcessing, minutesElapsed } = await checkIsProcessing(
         livestream.id
      )

      if (isProcessing) {
         res.status(200).send(
            `Transcription for live stream ${livestream.id} has been in progress for ${minutesElapsed} minutes (${progressObject.progress}% complete). Please wait for it to complete.`
         )
         return
      }

      try {
         await updateTranscriptStatus(livestream, "processing")

         const processingPromise = processAndStoreTranscription(
            livestream,
            progressObject
         )
         const timeoutPromise = createTimeout((TIMEOUT_SECONDS - 30) * 1000) // Manually throw an error 30 seconds before the timeout so we can update the status to error

         /**
          * Wait for the transcription to complete or for the timeout to occur.
          * If the timeout occurs, the transcription will be marked as failed.
          */
         const result = await Promise.race([processingPromise, timeoutPromise])

         res.status(200).send(result)
      } catch (error) {
         logger.error("Error in generateLiveStreamTranscript:", error)
         await updateTranscriptStatus(livestream, "error", error.message)
         res.status(500).send("An error occurred while processing the request")
      }
   }
)

export const generateTranscriptEmbeddings = onDocumentWritten(
   "livestreamTranscripts/{transcriptId}",
   async (event) => {
      const changeType = getChangeTypeEnum(event.data)
      const snapshot = event.data

      const transcript = snapshot.after.data() as
         | LivestreamTranscript
         | undefined

      const oldTranscript = snapshot.before.data() as
         | LivestreamTranscript
         | undefined

      if (changeType === ChangeType.DELETE) {
         logger.info("Transcript deleted, deleting embeddings")
         await transcriptEmbeddingService.deleteExistingEmbeddings(
            oldTranscript?.livestream.id
         )
         return
      }

      if (transcript?.status !== "complete") {
         logger.info(
            `Transcript status is ${transcript.status}, not generating embeddings yet`
         )
         return
      }

      if (oldTranscript?.transcript === transcript.transcript) {
         logger.info("Transcript has not changed, not generating embeddings")
         return
      }

      try {
         const livestream = await livestreamsRepo.getById(
            transcript.livestream.id
         )

         await transcriptEmbeddingService.generateAndStoreTranscriptEmbeddings(
            livestream,
            transcript
         )

         logger.log(
            `Successfully generated and stored embeddings for live stream ${livestream.id}`
         )
      } catch (error) {
         logger.error("Error generating transcript embeddings:", error)
         throw error // Rethrowing the error will cause the function to retry
      }
   }
)

async function processAndStoreTranscription(
   livestream: LivestreamEvent,
   progressObject: { progress: number }
): Promise<string> {
   const gcsUri = `gs://careerfairy-e1fd9.appspot.com/live-stream-audio-recordings/${livestream.id}.wav`

   // Create speech contexts based on livestream information
   const speechContexts = createLivestreamSpeechContexts(livestream)

   const transcriptionSegments = await transcribeLongAudio(
      gcsUri,
      {
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
      },
      (newProgress) => {
         progressObject.progress = newProgress
      }
   )

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
   status: "processing" | "complete" | "error",
   error?: string
) {
   logger.info(
      `Updating livestream ${livestream.id} transcript status to: ${status}`
   )
   const updateData: Partial<LivestreamTranscript> = {
      status,
      statusUpdatedAt: Timestamp.now(),
      livestream: pickPublicDataFromLivestream(livestream),
   }

   // Only add the error field if it's defined
   if (error) {
      updateData.error = error
   }

   return firestore
      .collection("livestreamTranscripts")
      .withConverter<LivestreamTranscript>(createGenericConverter())
      .doc(livestream.id)
      .set(updateData, { merge: true })
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

   const transcript = transcriptSegments
      .map((segment) => segment.transcript)
      .join("\n")

   // Create main document
   void bulkWriter.set(
      mainDocRef,
      {
         livestream: pickPublicDataFromLivestream(livestream),
         transcriptUpdatedAt: Timestamp.now(),
         status: "complete",
         statusUpdatedAt: Timestamp.now(),
         totalSegments: transcriptSegments.length,
         transcript,
         id: mainDocRef.id,
         numberOfWords: transcript.split(" ").length,
         numberOfCharacters: transcript.length,
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
