import React, { FC, useEffect } from "react"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import { useFilePicker } from "use-file-picker"
import { MAX_GROUP_PHOTOS_COUNT } from "@careerfairy/shared-lib/groups/constants"
import LoadingButton from "@mui/lab/LoadingButton"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { Typography } from "@mui/material"

type PhotoUploadButtonProps = {
   handleUploadPhotos: (photos: File[]) => Promise<void>
   isAddingPhotos: boolean
}

const PhotoUploadButton: FC<PhotoUploadButtonProps> = ({
   isAddingPhotos,
   handleUploadPhotos,
}) => {
   const { errorNotification } = useSnackbarNotifications()
   const [openFileSelector, { loading, errors, plainFiles, clear }] =
      useFilePicker({
         multiple: true,
         readAs: "DataURL", // available formats: "Text" | "BinaryString" | "ArrayBuffer" | "DataURL"
         accept: [".jpg", ".jpeg", ".png"],
         limitFilesConfig: { min: 1, max: MAX_GROUP_PHOTOS_COUNT },
         maxFileSize: 3, // in megabytes
      })

   useEffect(() => {
      const error = errors[0]
      if (!error) return
      if (error.maxLimitExceeded) {
         errorNotification(
            `You can only select up to ${MAX_GROUP_PHOTOS_COUNT} images`
         )
      }
      if (error.fileSizeToolarge) {
         errorNotification(`Image size is too large`)
      }
      if (error.readerError) {
         errorNotification(`Error reading image`)
      }
   }, [errorNotification, errors])

   useEffect(() => {
      if (plainFiles.length > 0) {
         // upload files
         void handleUploadPhotos(plainFiles).finally(() => {
            clear()
         })
      }
   }, [clear, handleUploadPhotos, plainFiles])

   return (
      <LoadingButton
         loading={loading || isAddingPhotos}
         disabled={loading || isAddingPhotos}
         onClick={openFileSelector}
         startIcon={<AddCircleOutlineIcon />}
         variant="text"
         color="primary"
      >
         <Typography fontSize={"15px"} fontWeight={"600"}>
            ADD PHOTO
         </Typography>
      </LoadingButton>
   )
}
export default PhotoUploadButton
