import { useCallback, useMemo, useState } from "react"
import { v4 as uuid } from "uuid"
import { FileUploaderProps } from "../../views/common/FileUploader"
import useFirebaseUpload from "../useFirebaseUpload"
import useSnackbarNotifications from "../useSnackbarNotifications"

type UseUploadCreatorAvatar = {
   /**
    *  Uploads a creator's avatar to Firebase storage.
    * @param file The file to upload.
    * @returns The URL of the uploaded file.
    */
   handleUploadCreatorAvatar: (file: File) => Promise<string>
   handleError: (errorMsg: string) => void
   avatarUploaded: boolean
   isLoading: boolean
   dragActive: boolean
   setDragActive: (dragActive: boolean) => void
   progress: number
   uploading: boolean
   fileUploaderProps: FileUploaderProps
}

/**
 * Hook that provides functionality to upload a creator's avatar to Firebase storage.
 * @param groupId The ID of the group the creator belongs to.
 * @returns An object containing upload related state and methods.
 */
const useUploadCreatorAvatar = (
   groupId: string,
   onFileValidated: (file: File) => void
): UseUploadCreatorAvatar => {
   const { errorNotification } = useSnackbarNotifications()

   const [loading, setLoading] = useState(false)
   const [dragActive, setDragActive] = useState(false)
   const [upload, progress, uploading] = useFirebaseUpload()
   const [avatarUploaded, setAvatarUploaded] = useState(false)

   const handleUploadCV = useCallback(
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

   const handleError = useCallback(
      (errorMsg: string) => {
         errorNotification(errorMsg, errorMsg)
      },
      [errorNotification]
   )

   const isLoading = loading || uploading

   return useMemo<UseUploadCreatorAvatar>(
      () => ({
         handleUploadCreatorAvatar: handleUploadCV,
         handleError,
         avatarUploaded,
         isLoading,
         dragActive,
         setDragActive,
         progress,
         uploading,
         fileUploaderProps: {
            onTypeError: handleError,
            onSizeError: handleError,
            types: ["png", "jpeg", "jpg", "PNG", "JPEG", "JPG"],
            multiple: false,
            maxSize: 10,
            disabled: isLoading || avatarUploaded,
            onDraggingStateChange: setDragActive,
            handleChange: (file) => {
               const fileObj = Array.isArray(file) ? file[0] : file
               onFileValidated(fileObj)
            },
         },
      }),
      [
         avatarUploaded,
         dragActive,
         handleError,
         handleUploadCV,
         isLoading,
         onFileValidated,
         progress,
         uploading,
      ]
   )
}

export default useUploadCreatorAvatar
