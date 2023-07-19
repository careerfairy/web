import { useCallback, useState } from "react"
import useSnackbarNotifications from "../useSnackbarNotifications"
import useFirebaseUpload from "../useFirebaseUpload"
import { v4 as uuid } from "uuid"

type UseUploadFile = {
   /**
    * Uploads a creator's avatar to Firebase storage.
    * @param file The file to upload.
    * @returns The URL of the uploaded file.
    * */
   handleUploadFile: (file: File) => Promise<{
      // The URL of the uploaded file.
      url: string
      // The ID of the video
      videoId: string
   }>
   avatarUploaded: boolean
   isLoading: boolean
   progress: number
   uploading: boolean
}

/**
 * Hook that provides functionality to upload a creator's avatar to Firebase storage.
 * @returns An object containing upload related state and methods.
 *
 * Note: The file is first uploaded to a temporary location in Firebase Storage,
 * then a server-side Cloud Function performs validation on the file including
 * checks for video duration, aspect ratio, etc. Due to the resource-intensive
 * nature of these checks and to ensure accuracy and security, they are not
 * performed client-side.
 */
const useUploadSparkVideo = (): UseUploadFile => {
   const { errorNotification } = useSnackbarNotifications()
   const [loading, setLoading] = useState(false)
   const [upload, progress, uploading] = useFirebaseUpload()
   const [avatarUploaded, setAvatarUploaded] = useState(false)

   const handleUploadFile = useCallback(
      async (file: File) => {
         try {
            const videoId = uuid()
            setLoading(true)
            const fileExtension = file.name.split(".").pop()
            const path = `sparks/${videoId}.${fileExtension}`
            const url = await upload(file, path)
            setAvatarUploaded(true)
            return {
               url,
               videoId,
            }
         } catch (error) {
            errorNotification(
               error,
               "There was an error uploading your video. Please try again."
            )
         } finally {
            setLoading(false)
         }
      },
      [errorNotification, upload]
   )

   const isLoading = loading || uploading

   return {
      handleUploadFile,
      avatarUploaded,
      isLoading,
      progress,
      uploading,
   }
}

export default useUploadSparkVideo
