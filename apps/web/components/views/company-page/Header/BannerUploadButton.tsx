import React, { FC, useEffect } from "react"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import { useFilePicker, Validator } from "use-file-picker"
import { MAX_GROUP_PHOTOS_COUNT } from "@careerfairy/shared-lib/groups/GroupPresenter"
import LoadingButton from "@mui/lab/LoadingButton"
import { Typography } from "@mui/material"
import UploadBannerIcon from "@mui/icons-material/CameraAltOutlined"
import { sxStyles } from "../../../../types/commonTypes"
import { darken } from "@mui/material/styles"

type BannerPhotoUploadButtonProps = {
   handleUploadBannerPhoto: (photos: File[]) => Promise<void>
   isAddingBannerPhoto: boolean
}

const imageValidator: Validator = {
   validateBeforeParsing: async (config, plainFiles) =>
      new Promise<void>((res, rej) =>
         plainFiles.every((file) => file.type.startsWith("image/"))
            ? res()
            : rej({ invalidFileType: true })
      ),
   validateAfterParsing: () => Promise.resolve(),
}

const styles = sxStyles({
   button: {
      bgcolor: "white",
      boxShadow: "none",
      "&:hover": {
         boxShadow: "none",
         bgcolor: (theme) => darken(theme.palette.common.white, 0.1),
      },
   },
})
const BannerUploadButton: FC<BannerPhotoUploadButtonProps> = ({
   isAddingBannerPhoto,
   handleUploadBannerPhoto,
}) => {
   const { errorNotification } = useSnackbarNotifications()
   const [openFileSelector, { loading, errors, plainFiles, clear }] =
      useFilePicker({
         multiple: false,
         accept: [".jpg", ".jpeg", ".png", ".webp"],
         maxFileSize: 5, // in megabytes
         validators: [imageValidator],
         imageSizeRestrictions: {
            minWidth: 864,
            minHeight: 172,
            maxWidth: 4300,
            maxHeight: 900,
         },
      })

   useEffect(() => {
      const error = errors[0]
      if (!error) return
      if (error.maxLimitExceeded) {
         errorNotification(`You can only select 1 image`)
      }
      if (error.fileSizeToolarge) {
         errorNotification(`Image size is too large`)
      }
      if (error.readerError) {
         errorNotification(`Error reading image`)
      }
      if (error.imageSizeTooSmall) {
         errorNotification(`Image size is too small`)
      }
      if (error.imageSizeTooBig) {
         errorNotification(`Image size is too big`)
      }
      // if(error.) {
      //
      // }

      // @ts-ignore - this is a custom error from our imageValidator
      if (error.invalidFileType) {
         errorNotification(`Only images are allowed`)
      }
   }, [errorNotification, errors])

   useEffect(() => {
      if (plainFiles.length > 0) {
         // upload files
         void handleUploadBannerPhoto(plainFiles).finally(() => {
            clear()
         })
      }
   }, [clear, errorNotification, handleUploadBannerPhoto, plainFiles])

   return (
      <LoadingButton
         sx={styles.button}
         loading={loading || isAddingBannerPhoto}
         disabled={loading || isAddingBannerPhoto}
         onClick={openFileSelector}
         startIcon={<UploadBannerIcon />}
         variant="contained"
         color="grey"
      >
         <Typography fontSize={"15px"} fontWeight={"600"}>
            EDIT COVER PHOTO
         </Typography>
      </LoadingButton>
   )
}
export default BannerUploadButton
