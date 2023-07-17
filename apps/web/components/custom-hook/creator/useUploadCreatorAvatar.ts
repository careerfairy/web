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
   handleUploadFile: (file: File) => Promise<string>
   avatarUploaded: boolean
   isLoading: boolean
   progress: number
   uploading: boolean
}

/**
 * Hook that provides functionality to upload a creator's avatar to Firebase storage.
 * @param groupId The ID of the group the creator belongs to.
 * @returns An object containing upload related state and methods.
 * */
const useUploadCreatorAvatar = (groupId: string): UseUploadFile => {
   const { errorNotification } = useSnackbarNotifications()
   const [loading, setLoading] = useState(false)
   const [upload, progress, uploading] = useFirebaseUpload()
   const [avatarUploaded, setAvatarUploaded] = useState(false)

   const handleUploadFile = useCallback(
      async (file: File) => {
         try {
            setLoading(true)
            const fileExtension = file.name.split(".").pop()
            const path = `groups/${groupId}/creator-avatars/${uuid()}${fileExtension}}`
            const url = await upload(file, path)
            setAvatarUploaded(true)
            return url
         } catch (error) {
            errorNotification("Error uploading Creator Avatar")
            setAvatarUploaded(false)
         } finally {
            setLoading(false)
         }
      },
      [groupId, upload, errorNotification]
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

export default useUploadCreatorAvatar
