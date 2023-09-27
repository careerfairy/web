import { useCallback, useState } from "react"
import { v4 as uuid } from "uuid"
import useSnackbarNotifications from "./useSnackbarNotifications"
import useFirebaseUpload from "./useFirebaseUpload"
import { ImageType } from "@careerfairy/shared-lib/commonTypes"
import useFirebaseDelete from "./utils/useFirebaseDelete"

export type UseUploadImage = {
   handleUploadImage: (file: File) => Promise<ImageType>
   imageUploaded: boolean
   isLoading: boolean
   progress: number
   uploading: boolean
}

/**
 * useUploadImage is a custom hook for uploading images to Firebase Storage
 * @param storagePath the path in Firebase Storage to upload the image to
 * @param onUploadComplete (optional) a callback function that will be called with the uploaded image object if the upload is successful
 * @returns a tuple containing the handleUploadImage function, upload status, and progress
 *
 * @example
 * // Usage:
 * const [handleUploadImage, imageUploaded, isLoading, progress] = useUploadImage("images");
 * // To upload an image:
 * handleUploadImage(file);
 */
const useUploadImage = (
   storagePath: string,
   onUploadComplete?: (image: ImageType) => void
): UseUploadImage => {
   const { errorNotification } = useSnackbarNotifications()
   const [loading, setLoading] = useState(false)
   const [upload, progress, uploading] = useFirebaseUpload()
   const [deleteImages] = useFirebaseDelete()
   const [imageUploaded, setImageUploaded] = useState(false)

   const handleUploadImage = useCallback(
      async (file: File): Promise<ImageType> => {
         let uploadedImageURL: string | null = null
         try {
            setLoading(true)
            const fileExtension = file.name.split(".").pop() || ""
            const fileName = uuid()
            const path = `${storagePath}/${fileName}.${fileExtension}`

            const url = await upload(file, path)
            uploadedImageURL = url

            const image = await createImageObject(file, path, fileName, url)

            if (onUploadComplete) {
               onUploadComplete(image)
            }

            setImageUploaded(true)
            return image
         } catch (error) {
            errorNotification(error, "Error uploading image", {
               storagePath,
               file,
            })
            setImageUploaded(false)
            if (uploadedImageURL) {
               deleteImages([uploadedImageURL])
            }
            throw error
         } finally {
            setLoading(false)
         }
      },
      [storagePath, upload, onUploadComplete, errorNotification, deleteImages]
   )

   const isLoading = loading || uploading

   return {
      handleUploadImage,
      imageUploaded,
      isLoading,
      progress,
      uploading,
   }
}

/**
 * Creates an ImageType object from a given file and path.
 * @param {File} file - The file to create the ImageType object from.
 * @param {string} path - The path where the file is located.
 * @returns {Promise<ImageType>} A promise that resolves to an ImageType object.
 */
const createImageObject = (
   file: File,
   path: string,
   fileName: string,
   url: string
): Promise<ImageType> => {
   return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = function (this: HTMLImageElement) {
         resolve({
            url,
            extension: file.name.split(".").pop() || "",
            width: this.width,
            height: this.height,
            fileName,
            path: path,
         })
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
   })
}

export default useUploadImage
