import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { TranscriptionSegment } from "@careerfairy/shared-lib/utils/transcription"
import { protos } from "@google-cloud/speech"
import { Timestamp } from "firebase-admin/firestore"
import { logger } from "firebase-functions/v2"
import { speechClient } from "../../api/speech"

export type IRecognizeRequest =
   protos.google.cloud.speech.v1p1beta1.IRecognizeRequest

type Config = IRecognizeRequest["config"]
type SpeechContext = Config["speechContexts"]

/**
 * Transcribes a long audio file from Google Cloud Storage using Speech-to-Text API.
 *
 * @param {string} gcsUri - GCS URI of the audio file.
 * @param  [config={}] - Optional speech recognition config.
 * @returns Array of transcription paragraphs.
 * @throws Error If speech recognition fails.
 *
 * @example
 * const segments = await transcribeLongAudio('gs://bucket/audio.wav', {
 *   languageCode: 'en-GB',
 *   enableSpeakerDiarization: true
 * });
 */
export async function transcribeLongAudio(
   gcsUri: string,
   config: IRecognizeRequest["config"] = {}
): Promise<TranscriptionSegment[]> {
   logger.debug("Initiating speech recognition", { gcsUri, config })

   const audio: IRecognizeRequest["audio"] = { uri: gcsUri }
   const request: IRecognizeRequest = { audio, config }

   const [operation] = await speechClient.longRunningRecognize(request)
   logger.info("Long-running speech recognition initiated")

   operation.on("progress", (metadata) => {
      const progress = metadata.progressPercent || 0
      progress && logger.info(`Transcription progress: ${progress}%`)
   })

   const [response] = await operation.promise()
   logger.info("Speech recognition completed")

   const paragraphs = response.results.map((result) => result.alternatives[0])
   const transcriptionLength = paragraphs.reduce(
      (a, b) => a + b.transcript.length,
      0
   )

   logger.info("Transcription generated", {
      transcriptionLength,
      paragraphCount: paragraphs.length,
   })

   return paragraphs.map<TranscriptionSegment>((segment, index) => ({
      confidence: segment.confidence,
      transcript: segment.transcript,
      words: segment.words.map((word) => ({
         word: word.word,
         startTime: new Timestamp(
            getSeconds(word.startTime.seconds),
            word.startTime.nanos
         ),
         endTime: new Timestamp(
            getSeconds(word.endTime.seconds),
            word.endTime.nanos
         ),
         confidence: word.confidence ?? 0,
         speakerTag: word.speakerTag ?? null,
      })),
      segmentIndex: index,
   }))
}

export function getSeconds(longValue: Long | string | number): number {
   if (typeof longValue === "string") {
      return parseFloat(longValue)
   }

   if (typeof longValue === "number") {
      return longValue
   }

   return longValue.toNumber()
}

/**
 * Creates speech recognition contexts for a livestream event.
 *
 * Generates speech contexts to improve speech-to-text accuracy for a livestream.
 * Uses livestream metadata to create relevant phrases with assigned boost values.
 *
 * Contexts include: event info, speakers, education, jobs, company details, and target audience.
 *
 * @param {LivestreamEvent} livestream - Livestream event metadata
 * @returns {SpeechContext} Array of speech contexts with phrases and boost values
 */
export const createLivestreamSpeechContexts = (
   livestream: LivestreamEvent
): SpeechContext => {
   const contexts: SpeechContext = []

   // Company and event information (highest boost)
   const generalContext = [
      livestream.company,
      livestream.title,
      `${livestream.company} event`,
      `${livestream.company} live stream`,
      ...(livestream.businessFunctionsTagIds || []).map(
         (tag) => `${tag} at ${livestream.company}`
      ),
      ...(livestream.contentTopicsTagIds || []).map(
         (topic) => `${topic} discussion`
      ),
   ].filter(Boolean)
   if (generalContext.length > 0) {
      contexts.push({ phrases: generalContext, boost: 20 })
   }

   // Speakers (high boost)
   const speakerContext =
      livestream.speakers?.flatMap((speaker) =>
         [
            `${speaker.firstName} ${speaker.lastName}`,
            `${speaker.firstName} ${speaker.lastName} from ${livestream.company}`,
            `${speaker.position} at ${livestream.company}`,
         ].filter(Boolean)
      ) || []
   if (speakerContext.length > 0) {
      contexts.push({ phrases: speakerContext, boost: 15 })
   }

   // Educational context (medium boost)
   const educationContext = [
      ...(livestream.targetFieldsOfStudy?.map((f) => `${f.name} degree`) || []),
      ...(livestream.targetLevelsOfStudy?.map((l) => `${l.name} level`) || []),
      "academic background",
      "educational requirements",
   ].filter(Boolean)
   if (educationContext.length > 0) {
      contexts.push({ phrases: educationContext, boost: 10 })
   }

   // Job-related terms (medium boost)
   if (livestream.hasJobs && livestream.jobs) {
      const jobContext = livestream.jobs.flatMap((job) => [
         job.name,
         `${job.name} at ${livestream.company}`,
         `${job.name} position`,
         `${job.name} role`,
         ...(job.description ? [job.description] : []),
      ])
      contexts.push({
         phrases: [
            ...jobContext,
            "job opportunities",
            "open positions",
            "application process",
            "career path",
            "employment opportunities at " + livestream.company,
         ],
         boost: 10,
      })
   }

   // Company metadata (medium boost)
   const companyContext = [
      ...(livestream.companyIndustries?.map(
         (industry) => `${industry} industry`
      ) || []),
      ...(livestream.companyCountries?.map((country) => `${country} office`) ||
         []),
      ...(livestream.companySizes?.map((size) => `company size ${size}`) || []),
      `${livestream.company} culture`,
      `working at ${livestream.company}`,
   ].filter(Boolean)
   if (companyContext.length > 0) {
      contexts.push({ phrases: companyContext, boost: 10 })
   }

   // Target audience (lower boost)
   const targetAudienceContext = [
      ...(livestream.companyTargetedCountries?.map(
         (country) => `opportunities in ${country}`
      ) || []),
      ...(livestream.companyTargetedUniversities?.map(
         (uni) => `recruiting from ${uni}`
      ) || []),
      ...(livestream.companyTargetedFieldsOfStudies?.map(
         (field) => `${field} background`
      ) || []),
   ].filter(Boolean)
   if (targetAudienceContext.length > 0) {
      contexts.push({ phrases: targetAudienceContext, boost: 5 })
   }

   return contexts
}
