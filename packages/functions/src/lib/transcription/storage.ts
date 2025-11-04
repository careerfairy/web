import { logger } from "firebase-functions/v2"
import { storage } from "../../api/firestoreAdmin"

const GCS_BASE_PATH = "transcriptions/livestreams"
const STORAGE_BUCKET = "careerfairy-e1fd9.appspot.com"

/**
 * Get the GCS file path for a transcription
 *
 * @param livestreamId - The livestream ID
 * @returns The GCS path for the transcription file
 */
export function getTranscriptionFilePath(livestreamId: string): string {
   return `${GCS_BASE_PATH}/${livestreamId}/transcription.json`
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
   transcriptionData: any
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
         errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw error
   }
}

/**
 * Get transcription data from Google Cloud Storage
 *
 * @param livestreamId - The livestream ID
 * @returns The transcription data
 */
export async function getTranscriptionFromGCS(
   livestreamId: string
): Promise<any | null> {
   logger.info("Fetching transcription from GCS", { livestreamId })

   const bucket = storage.bucket(STORAGE_BUCKET)
   const filePath = getTranscriptionFilePath(livestreamId)
   const file = bucket.file(filePath)

   try {
      // Check if file exists
      const [exists] = await file.exists()
      if (!exists) {
         logger.warn("Transcription file not found in GCS", {
            livestreamId,
            filePath,
         })
         return null
      }

      // Download file contents
      const [contents] = await file.download()
      const data = JSON.parse(contents.toString())

      logger.info("Transcription fetched from GCS successfully", {
         livestreamId,
         filePath,
      })

      return data
   } catch (error) {
      logger.error("Failed to fetch transcription from GCS", {
         livestreamId,
         filePath,
         error,
         errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw error
   }
}

/**
 * Check if a transcription file exists in GCS
 *
 * @param livestreamId - The livestream ID
 * @returns true if the file exists, false otherwise
 */
export async function transcriptionExistsInGCS(
   livestreamId: string
): Promise<boolean> {
   const bucket = storage.bucket(STORAGE_BUCKET)
   const filePath = getTranscriptionFilePath(livestreamId)
   const file = bucket.file(filePath)

   try {
      const [exists] = await file.exists()
      return exists
   } catch (error) {
      logger.error("Failed to check if transcription exists in GCS", {
         livestreamId,
         filePath,
         error,
      })
      return false
   }
}

/**
 * Delete a transcription file from GCS
 *
 * @param livestreamId - The livestream ID
 * @returns true if deletion was successful
 */
export async function deleteTranscriptionFromGCS(
   livestreamId: string
): Promise<boolean> {
   logger.info("Deleting transcription from GCS", { livestreamId })

   const bucket = storage.bucket(STORAGE_BUCKET)
   const filePath = getTranscriptionFilePath(livestreamId)
   const file = bucket.file(filePath)

   try {
      await file.delete()
      logger.info("Transcription deleted from GCS successfully", {
         livestreamId,
         filePath,
      })
      return true
   } catch (error) {
      logger.error("Failed to delete transcription from GCS", {
         livestreamId,
         filePath,
         error,
         errorMessage: error instanceof Error ? error.message : String(error),
      })
      return false
   }
}
