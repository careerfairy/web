import { ImageType } from "@careerfairy/shared-lib/commonTypes"
import useFileUploader from "components/custom-hook/useFileUploader"
import useUploadImage from "components/custom-hook/useUploadImage"
import { useCallback } from "react"
import { RecordingBannerFields } from "./RecordingFormFields"
import { useRecordingForm } from "./RecordingFormProvider"

export const RecordingBannerUploader = () => {
   const { watch, setValue } = useRecordingForm()
   const backgroundImageUrl = watch("backgroundImageUrl")

   const handleBackgroundImageUpload = useCallback(
      (image: ImageType) => {
         setValue("backgroundImageUrl", image.url, {
            shouldValidate: true,
         })
      },
      [setValue]
   )

   const { handleUploadImage } = useUploadImage(
      "illustration-images",
      handleBackgroundImageUpload
   )

   const handleFileUpload = useCallback(
      async (file: File | File[]) => {
         const fileToUpload = Array.isArray(file) ? file[0] : file
         await handleUploadImage(fileToUpload)
      },
      [handleUploadImage]
   )

   const { fileUploaderProps } = useFileUploader({
      acceptedFileTypes: ["png", "jpeg", "jpg", "PNG", "JPEG", "JPG"],
      maxFileSize: 10, // MB
      multiple: false,
      onValidated: handleFileUpload,
   })

   return (
      <RecordingBannerFields
         backgroundImageUrl={backgroundImageUrl}
         fileUploaderProps={fileUploaderProps}
      />
   )
}
