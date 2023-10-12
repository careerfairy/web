import { useCallback, useMemo, useState } from "react"
import { v4 as uuid } from "uuid"
import useSnackbarNotifications from "./useSnackbarNotifications"
import useFirebaseUpload from "./useFirebaseUpload"

export type FileMetadata = {
   url: string
   uid: string
   fileExtension: string
}

/**
 * Type definition for the return value of useUploadFile.
 */
type UseUploadFile = {
   /**
    * Function to handle the upload of a file.
    * @param file - The file to upload.
    * @returns An object containing the url and the unique id (uid) of the uploaded file.
    */
   handleUploadFile: (file: File) => Promise<FileMetadata>

   /**
    * A boolean indicating if the file has been uploaded successfully.
    */
   fileUploaded: boolean

   /**
    * A boolean indicating if the file is currently being uploaded.
    */
   isLoading: boolean

   /**
    * The current progress of the upload as a percentage.
    */
   progress: number

   /**
    * A boolean indicating if the file is currently being uploaded.
    */
   uploading: boolean
}

/**
 * A custom hook that provides functionality to upload a file to Firebase storage.
 *
 * @param {string} storagePath - The storage path in Firebase where the file should be uploaded.
 * @param {(url: string, fileName: string) => void} [onUploadComplete] - An optional callback function that is called when the upload is complete. The function receives the URL of the uploaded file and the generated filename as arguments.
 *
 * @returns {object} An object containing the following properties:
 * - `handleUploadFile`: The callback to be passed to Formik's onSubmit prop.
 * - `fileUploaded`: A boolean indicating if the file has been uploaded successfully.
 * - `isLoading`: A boolean indicating if the handleUploadFile operation is loading.
 * - `progress`: The current progress of the upload as a percentage.
 * - `uploading`: A boolean indicating if the file is currently being uploaded.
 *
 */
const useUploadFile = (
   storagePath: string,
   onUploadComplete?: (
      url: string,
      fileName: string,
      fileExtension: string
   ) => void
): UseUploadFile => {
   const { errorNotification } = useSnackbarNotifications()
   const [loading, setLoading] = useState(false)
   const [upload, progress, uploading] = useFirebaseUpload()
   const [fileUploaded, setFileUploaded] = useState(false)

   /**
    * Function to handle the upload of a file.
    *
    * @param {File} file - The file to upload.
    *
    * @returns {Promise} A promise that resolves to an object containing the URL and unique ID (UUID) of the uploaded file.
    */
   const handleUploadFile = useCallback(
      async (file: File) => {
         try {
            setLoading(true)
            const fileExtension = file.name.split(".").pop()
            const fileName = uuid()
            const path = `${storagePath}/${fileName}.${fileExtension}`
            const url = await upload(file, path)

            // Call the provided callback function with the URL and UUID of the uploaded file
            if (onUploadComplete) {
               onUploadComplete(url, fileName, fileExtension)
            }

            setFileUploaded(true)
            return { url, uid: fileName, fileExtension }
         } catch (error) {
            errorNotification(error, "Error uploading file", {
               storagePath,
               file,
            })
            setFileUploaded(false)
         } finally {
            setLoading(false)
         }
      },
      [storagePath, upload, onUploadComplete, errorNotification]
   )

   const isLoading = loading || uploading

   return useMemo<UseUploadFile>(
      () => ({
         handleUploadFile,
         fileUploaded,
         isLoading,
         progress,
         uploading,
      }),
      [handleUploadFile, fileUploaded, isLoading, progress, uploading]
   )
}

export default useUploadFile
