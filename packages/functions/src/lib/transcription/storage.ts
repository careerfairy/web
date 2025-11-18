import { logger } from "firebase-functions/v2"
import { storage } from "../../api/firestoreAdmin"
import { ITranscriptionResult } from "./types"
import { getErrorMessage } from "./utils"

const STORAGE_BUCKET = "careerfairy-e1fd9.appspot.com"
const GCS_BASE_PATH = "transcriptions/livestreams"

/**
 * Get the GCS file path for a transcription
 *
 * @param livestreamId - The livestream ID
 * @returns The GCS path for the transcription file
 */
export function getTranscriptionFilePath(livestreamId: string): string {
   return `${GCS_BASE_PATH}/${livestreamId}/transcription.json`
}

export async function fetchTranscriptionFromGCS(
   livestreamId: string
): Promise<ITranscriptionResult> {
   logger.info("Fetching transcription from GCS", { livestreamId })

   const bucket = storage.bucket(STORAGE_BUCKET)
   const filePath = getTranscriptionFilePath(livestreamId)
   const file = bucket.file(filePath)

   const [exists] = await file.exists()

   if (!exists) {
      throw new Error(`Transcription file not found at ${filePath}`)
   }

   const [contents] = await file.download()
   return JSON.parse(contents.toString("utf-8")) as ITranscriptionResult
}

/**
 * Check if transcription already exists in GCS for a livestream
 *
 * @param livestreamId - The livestream ID
 * @returns True if transcription file exists, false otherwise
 */
export async function transcriptionExistsInGCS(
   livestreamId: string
): Promise<boolean> {
   try {
      const bucket = storage.bucket(STORAGE_BUCKET)
      const filePath = getTranscriptionFilePath(livestreamId)
      const file = bucket.file(filePath)
      const [exists] = await file.exists()
      return exists
   } catch (error) {
      logger.error("Error checking transcription existence in GCS", {
         livestreamId,
         error,
         errorMessage: getErrorMessage(error),
      })
      // If we can't check, assume it doesn't exist to avoid skipping
      return false
   }
}

/**
 * Save transcription data to Google Cloud Storage
 *
 * @param livestreamId - The livestream ID
 * @param transcriptionData - The transcription data to save
 * @returns The GCS path where the file was saved
 */
export async function saveTranscriptionToGCS(
   livestreamId: string,
   transcriptionData: ITranscriptionResult
): Promise<string> {
   logger.info("Saving transcription to GCS", { livestreamId })

   const bucket = storage.bucket(STORAGE_BUCKET)
   const filePath = getTranscriptionFilePath(livestreamId)
   const file = bucket.file(filePath)

   try {
      // Convert data to JSON string
      const jsonData = JSON.stringify(transcriptionData, null, 2)

      // Convert to Buffer for proper upload
      const buffer = Buffer.from(jsonData, "utf-8")

      // Save to GCS using save method with Buffer
      await file.save(buffer, {
         contentType: "application/json",
         metadata: {
            metadata: {
               livestreamId,
               uploadedAt: new Date().toISOString(),
            },
         },
      })

      logger.info("Transcription saved to GCS successfully", {
         livestreamId,
         filePath,
         size: buffer.length,
      })

      // Return the GCS path
      return `gs://${bucket.name}/${filePath}`
   } catch (error) {
      logger.error("Failed to save transcription to GCS", {
         livestreamId,
         filePath,
         error,
         errorMessage: getErrorMessage(error),
      })
      throw error
   }
}
