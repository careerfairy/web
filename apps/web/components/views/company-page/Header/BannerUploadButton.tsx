import React, { FC, useState, useCallback } from "react"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import { BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/groups/GroupPresenter"
import LoadingButton from "@mui/lab/LoadingButton"
import { Box } from "@mui/material"
import UploadBannerIcon from "@mui/icons-material/CameraAltOutlined"
import { sxStyles } from "../../../../types/commonTypes"
import { darken } from "@mui/material/styles"
import useFileUploader from "../../../custom-hook/useFileUploader"
import FileUploader from "../../common/FileUploader"
import { getImageDimensionsValidator } from "../../common/FileUploader/validations"
import ImageCropperDialog from "../../common/ImageCropperDialog"
import { Upload } from "react-feather"

type BannerPhotoUploadButtonProps = {
   handleUploadBannerPhoto: (photos: File) => Promise<void>
   loading: boolean
   disabled?: boolean
}

const bannerImageValidator = getImageDimensionsValidator({
   maxHeight: BANNER_IMAGE_SPECS.maxHeight,
   maxWidth: BANNER_IMAGE_SPECS.maxWidth,
   minHeight: BANNER_IMAGE_SPECS.minHeight,
   minWidth: 600, // Reduced from 800px to be less restrictive
})

const styles = sxStyles({
   button: {
      bgcolor: "white",
      boxShadow: "none",
      "&:hover": {
         boxShadow: "none",
         bgcolor: (theme) => darken(theme.palette.common.white, 0.1),
      },
   },
   cropperSlider: {
      color: (theme) => theme.palette.secondary[600], // Using purple instead of turquoise
      "& .MuiSlider-rail": {
         opacity: 0.5,
         boxShadow: "inset 0px 0px 4px -2px #000",
         backgroundColor: (theme) => theme.palette.neutral[100],
      },
      "& .MuiSlider-thumb": {
         backgroundColor: (theme) => theme.brand.white[50],
         border: "2px solid currentColor",
         "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
            boxShadow: "inherit",
         },
         "&::before": {
            display: "none",
         },
      },
   },
   cropperApplyButton: {
      backgroundColor: (theme) => theme.palette.secondary[600], // Using purple instead of turquoise
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary[700],
      },
   },
})

const BannerUploadButton: FC<BannerPhotoUploadButtonProps> = ({
   loading,
   handleUploadBannerPhoto,
   disabled,
}) => {
   const { errorNotification, successNotification } = useSnackbarNotifications()
   const [objectUrl, setObjectUrl] = useState<string | null>(null)

   const setImage = (file, imageSetter) => {
      const newFile = Array.isArray(file) ? file[0] : file
      imageSetter(URL.createObjectURL(newFile))
   }

   const {
      fileUploaderProps: bannerUploaderProps,
   } = useFileUploader({
      acceptedFileTypes: BANNER_IMAGE_SPECS.allowedFormats,
      maxFileSize: BANNER_IMAGE_SPECS.maxSize,
      multiple: false,
      onValidated: (file) => setImage(file, setObjectUrl),
      customValidations: [bannerImageValidator],
   })

   const handleCloseCropImageDialog = () => {
      setObjectUrl(null)
   }

   const handleCropperImageSubmit = useCallback(
      async (image: File) => {
         try {
            await handleUploadBannerPhoto(image)
            successNotification("Company banner has been successfully updated")
            setObjectUrl(null)
         } catch (error) {
            errorNotification(error.message || "Failed to upload banner image")
         }
      },
      [handleUploadBannerPhoto, successNotification, errorNotification]
   )

   return (
      <>
         {objectUrl ? (
            <ImageCropperDialog
               title="Upload company banner"
               fileName={undefined}
               imageSrc={objectUrl}
               open={Boolean(objectUrl)}
               handleClose={handleCloseCropImageDialog}
               onSubmit={handleCropperImageSubmit}
               key={`update-company-banner`}
               cropType="rectangle"
               cropBoxResizable
               aspectRatio={6 / 1} // Banner aspect ratio (2880x480 ≈ 6:1)
               titleIcon={<Upload />}
               backButtonText="Cancel"
               cropperSlideSx={styles.cropperSlider}
               applyButtonSx={styles.cropperApplyButton}
            />
         ) : null}
         <FileUploader {...bannerUploaderProps}>
            <Box flexDirection="column" display="flex" alignItems="center">
               <LoadingButton
                  sx={styles.button}
                  loading={loading}
                  disabled={disabled}
                  startIcon={<UploadBannerIcon />}
                  variant="contained"
                  color="grey"
                  size="large"
               >
                  Edit cover photo
               </LoadingButton>
            </Box>
         </FileUploader>
      </>
   )
}
export default BannerUploadButton
