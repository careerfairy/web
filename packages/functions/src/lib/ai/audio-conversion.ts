import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { AudioProcessingStatus } from "@careerfairy/shared-lib/livestreams/ai"
import {
   NEW_CHANGES_DATE,
   S3_BUCKET_NAME,
   S3_ROOT_PATH,
} from "@careerfairy/shared-lib/livestreams/recordings"
import { logger } from "firebase-functions/v2"
import { onRequest } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import os from "os"
import path from "path"
import { Readable } from "stream"
import { pipeline } from "stream/promises"
import { s3Client } from "../../api/aws"
import {
   storage as firebaseStorage,
   firestore,
   Timestamp,
} from "../../api/firestoreAdmin"
import { livestreamsRepo } from "../../api/repositories"
import { withLock } from "../../middlewares/withLock"

const { log, error, debug } = logger

const GCS_DESTINATION_FOLDER = "live-stream-audio-recordings"
const GCS_BUCKET_NAME = "careerfairy-e1fd9.appspot.com"
const OLD_S3_ROOT_PATH = "directory1/directory5"
const MEMORY_LIMIT = "2GiB"
const TIMEOUT_SECONDS = 3600

export const processLivestreamAudioRecordingsHttp = onRequest(
   {
      timeoutSeconds: TIMEOUT_SECONDS,
      memory: MEMORY_LIMIT,
   },
   async (req, res) => {
      return withLock({
         lockName: "processLivestreamAudioRecordings",
         maxLockDuration: TIMEOUT_SECONDS * 1000,
      })(async () => {
         if (req.method !== "GET") {
            res.status(405).json({ error: "Method not allowed" })
            return
         }

         try {
            const result = await processLivestreamAudioRecordings()
            res.status(200).json(result)
         } catch (err) {
            error("Error in processLivestreamAudioRecordingsHttp:", err)
            res.status(500).json({ error: "Internal server error" })
         }
      })(req, res)
   }
)

export const processLivestreamAudioRecordingsScheduled = onSchedule(
   {
      schedule: "every 2 hours",
      timeoutSeconds: 540, // 9 minutes, max for pubsub
      memory: MEMORY_LIMIT,
   },
   async () => {
      try {
         const result = await processLivestreamAudioRecordings()
         log("Scheduled processing complete:", result)
      } catch (err) {
         error("Error in scheduled checkForNewRecordings:", err)
      }
   }
)

const processLivestreamAudioRecordings = async () => {
   debug("Starting checkForNewRecordings function")
   const livestreams = await getLivestreamsThatNeedAudioRecording()
   debug(`Found ${livestreams.length} live streams that need audio recording`)
   const processedFiles: string[] = []
   const skippedFiles: string[] = []

   for (let i = 0; i < livestreams.length; i++) {
      const livestream = livestreams[i]
      debug(
         `Processing livestream ${i + 1} of ${livestreams.length}: ${
            livestream.id
         }`
      )
      const s3Key = getLivestreamS3Key(livestream)
      debug(`Generated S3 key: ${s3Key}`)

      try {
         const exists = await checkIfS3ObjectExists(s3Key)
         debug(`S3 object exists: ${exists}`)

         if (!exists) {
            debug(`Skipping non-existent file: ${s3Key}`)
            skippedFiles.push(s3Key)
            await updateLivestreamAudioProcessingStatus(
               livestream.id,
               AudioProcessingStatus.SKIPPED,
               "S3 file does not exist"
            )
            continue
         }

         debug(`Processing MP4 file: ${s3Key}`)
         await processMP4File(s3Key, livestream.id)
         processedFiles.push(s3Key)
         debug(`Finished processing: ${s3Key}`)
         await updateLivestreamAudioProcessingStatus(
            livestream.id,
            AudioProcessingStatus.PROCESSED
         )
      } catch (err) {
         error(`Error processing livestream ${livestream.id}:`, err)
         skippedFiles.push(s3Key)
         await updateLivestreamAudioProcessingStatus(
            livestream.id,
            AudioProcessingStatus.ERROR,
            err.message
         )
         continue
      }

      log(`Progress: ${i + 1}/${livestreams.length} live streams processed`)
   }

   debug(
      `Processing complete. Processed ${processedFiles.length} files, skipped ${skippedFiles.length} files`
   )
   return {
      message: "Processing complete",
      processedFiles: processedFiles,
      skippedFiles: skippedFiles,
      numberOfProcessedFiles: processedFiles.length,
      numberOfSkippedFiles: skippedFiles.length,
   }
}

async function checkIfS3ObjectExists(s3Key: string): Promise<boolean> {
   try {
      const command = new HeadObjectCommand({
         Bucket: S3_BUCKET_NAME,
         Key: s3Key,
      })
      await s3Client.send(command)
      return true
   } catch (error) {
      if ((error as any).name === "NotFound") {
         return false
      }
      throw error
   }
}

async function processMP4File(s3Key: string, livestreamId: string) {
   const tempDir = os.tmpdir()
   const tempMp4Path = path.join(tempDir, path.basename(s3Key))
   const tempWavPath = tempMp4Path.replace(".mp4", ".wav")
   const gcsDestination = `${GCS_DESTINATION_FOLDER}/${livestreamId}.wav`

   try {
      // Download the MP4 file from S3
      await downloadFromS3(s3Key, tempMp4Path)

      // Verify the MP4 file
      await verifyFile(tempMp4Path, "MP4")

      // Convert the MP4 file to WAV
      await convertToWav(tempMp4Path, tempWavPath)

      // Verify the WAV file
      await verifyFile(tempWavPath, "WAV")

      // Upload the WAV file to GCS
      await uploadToGCS(tempWavPath, gcsDestination)

      // Update the livestream to mark the audio file as saved
      await updateLivestreamAudioProcessingStatus(
         livestreamId,
         AudioProcessingStatus.PROCESSED
      )

      // Clean up the temporary files
      await cleanupTempFiles(tempMp4Path, tempWavPath)

      log(`Successfully processed ${s3Key}`)
   } catch (err) {
      error(`Error processing ${s3Key}:`, err)
      throw err
   }
}

const verifyFile = async (
   filePath: string,
   fileType: string
): Promise<void> => {
   if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
      debug(`${fileType} file size: ${fileSizeMB} MB`)
   } else {
      const errorMessage = `${fileType} file ${filePath} does not exist`
      error(errorMessage)
      throw new Error(errorMessage)
   }
}

const cleanupTempFiles = async (...filePaths: string[]): Promise<void> => {
   for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
         fs.unlinkSync(filePath)
         debug(`Deleted temporary file: ${filePath}`)
      }
   }
}

const convertToWav = (
   tempMp4Path: string,
   tempWavPath: string
): Promise<void> => {
   return new Promise((resolve, reject) => {
      debug(`Starting conversion of ${tempMp4Path} to ${tempWavPath}`)

      if (!fs.existsSync(tempMp4Path)) {
         const errorMessage = `Input file ${tempMp4Path} does not exist`
         error(errorMessage)
         return reject(new Error(errorMessage))
      }

      ffmpeg(tempMp4Path)
         .outputOptions("-acodec pcm_s16le")
         .outputOptions("-ar 16000")
         .outputOptions("-ac 1")
         .on("start", (commandLine) => {
            debug(`FFmpeg command: ${commandLine}`)
         })
         .on("progress", (progress) => {
            debug(`Processing: ${progress.percent}% done`)
         })
         .save(tempWavPath)
         .on("end", () => {
            if (fs.existsSync(tempWavPath)) {
               log(`Successfully converted ${tempMp4Path} to ${tempWavPath}`)
               resolve()
            } else {
               const errorMessage = `Conversion completed but ${tempWavPath} does not exist`
               error(errorMessage)
               reject(new Error(errorMessage))
            }
         })
         .on("error", (err) => {
            error(`Error converting ${tempMp4Path} to WAV:`, err)
            reject(err)
         })
   })
}

const downloadFromS3 = async (s3Key: string, tempMp4Path: string) => {
   const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
   })

   try {
      const { Body } = await s3Client.send(command)

      if (Body instanceof Readable) {
         const writeStream = fs.createWriteStream(tempMp4Path)
         await pipeline(Body, writeStream)
         log(`Successfully downloaded ${s3Key} to ${tempMp4Path}`)
      } else {
         throw new Error("S3 object body is not a readable stream")
      }
   } catch (err) {
      error(`Error downloading ${s3Key} from S3:`, err)
      throw err
   }
}

const uploadToGCS = async (
   tempWavPath: string,
   gcsDestination: string
): Promise<void> => {
   const bucket = firebaseStorage.bucket(GCS_BUCKET_NAME)
   const file = bucket.file(gcsDestination)
   const stream = file.createWriteStream()

   const readStream = fs.createReadStream(tempWavPath)
   await pipeline(readStream, stream)
   log(`Successfully uploaded ${tempWavPath} to ${gcsDestination}`)
   return
}

type LivestreamWithSID = LivestreamEvent & { sid: string }

const getLivestreamsThatNeedAudioRecording = async (): Promise<
   LivestreamWithSID[]
> => {
   const livestreams = await livestreamsRepo.getLivestreamsForAudioProcessing(
      AudioProcessingStatus.PENDING
   )

   const promises = livestreams.map(async (livestream) => {
      const token = await livestreamsRepo.getLivestreamRecordingToken(
         livestream.id
      )
      return { ...livestream, sid: token?.sid ?? "" }
   })

   return Promise.all(promises)
}

const updateLivestreamAudioProcessingStatus = async (
   livestreamId: string,
   status: AudioProcessingStatus,
   errorMessage?: string
) => {
   const updateData: Pick<
      LivestreamEvent,
      | "audioProcessingStatus"
      | "audioProcessingError"
      | "audioProcessedAtTimeMs"
   > = {
      audioProcessingStatus: status,
      audioProcessedAtTimeMs: Timestamp.now().toMillis(),
   }

   if (status === AudioProcessingStatus.ERROR && errorMessage) {
      updateData.audioProcessingError = errorMessage
   }

   return firestore
      .collection("livestreams")
      .doc(livestreamId)
      .update(updateData)
}

const getLivestreamS3Key = (livestream: LivestreamWithSID) => {
   if (livestream.start.toMillis() < NEW_CHANGES_DATE) {
      return `${OLD_S3_ROOT_PATH}/${livestream.sid}_${livestream.id}_0.mp4`
   }
   return `${S3_ROOT_PATH}/${livestream.id}/${livestream.sid}_${livestream.id}_0.mp4`
}
