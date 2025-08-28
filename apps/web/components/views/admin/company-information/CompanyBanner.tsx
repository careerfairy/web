import { BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Avatar, Box, Button, Stack, Typography } from "@mui/material"
import useUploadGroupBanner from "components/custom-hook/group/useUploadGroupBanner"
import useFileUploader from "components/custom-hook/useFileUploader"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import FileUploader from "components/views/common/FileUploader"
import { getImageDimensionsValidator } from "components/views/common/FileUploader/validations"
import ImageCropperDialog from "components/views/common/ImageCropperDialog"
import { FC, useCallback, useState } from "react"
import { Upload } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   companyBannerUploadArea: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      borderRadius: 1,
      border: "1px solid #EDE7FD",
      background: "#F7F8FC",
      color: "#9999B1",
      fontSize: "0.85714rem",
      fontWeight: 300,
      position: "relative",
   },
   uploadPictureButton: {
      textTransform: "none",
      mt: 1.5,
   },
   companyBanner: {
      "&:hover": {
         "& .banner-preview": {
            opacity: 0,
         },
         "& .banner-upload-cta": {
            opacity: 1,
         },
      },

      "& .banner-preview": {
         transition: (theme) => theme.transitions.create("opacity"),
         position: "absolute",
         width: "100%",
         height: "100%",
      },

      "& .banner-upload-cta": {
         opacity: 0,
         transition: (theme) => theme.transitions.create("opacity"),
      },
      width: "100%",
      height: 144,
      position: "relative",
      cursor: "pointer",
   },
   imageLabelVisible: {
      "& .banner-preview": {
         opacity: 0,
      },
      "& .banner-upload-cta": {
         opacity: 1,
      },
   },
   bannerImage: {
      width: "100%",
      height: "100%",
      borderRadius: 1,
      position: "absolute",
   },
   greyOverlay: {
      width: "100%",
      height: "100%",
      position: "absolute",
      opacity: 0.95,
      background: `linear-gradient(0deg, rgba(247, 248, 252, 0.96) 0%, rgba(247, 248, 252, 0.96) 100%), lightgray 50% / cover no-repeat`,
   },
   cropperSlider: {
      color: (theme) => theme.palette.secondary[600],
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
      backgroundColor: (theme) => theme.palette.secondary[600],
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary[700],
      },
   },
})

type CompanyBannerProps = {
   url: string
   groupId: string
}

const bannerImageValidator = getImageDimensionsValidator({
   maxHeight: BANNER_IMAGE_SPECS.maxHeight,
   maxWidth: BANNER_IMAGE_SPECS.maxWidth,
   minHeight: BANNER_IMAGE_SPECS.minHeight,
   minWidth: 600,
})

const CompanyBanner: FC<CompanyBannerProps> = ({ url, groupId }) => {
   const { handleUploadImage: handleUploadBanner } =
      useUploadGroupBanner(groupId)
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const [objectUrl, setObjectUrl] = useState<string | null>(null)

   const setImage = (
      file: File | File[],
      imageSetter: (url: string) => void
   ) => {
      const newFile = Array.isArray(file) ? file[0] : file
      imageSetter(URL.createObjectURL(newFile))
   }

   const {
      fileUploaderProps: bannerUploaderProps,
      dragActive: bannerDragActive,
   } = useFileUploader({
      acceptedFileTypes: BANNER_IMAGE_SPECS.allowedFormats,
      maxFileSize: BANNER_IMAGE_SPECS.maxSize, // Use the spec value
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
            await handleUploadBanner(image)
            successNotification("Company banner has been successfully updated")
            setObjectUrl(null)
         } catch (error: any) {
            errorNotification(error?.message || "Failed to upload banner image")
         }
      },
      [handleUploadBanner, successNotification, errorNotification]
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
               key={`update-${groupId}-company-banner`}
               cropType="rectangle"
               cropBoxResizable
               aspectRatio={6 / 1}
               titleIcon={<Upload />}
               backButtonText="Cancel"
               cropperSlideSx={styles.cropperSlider}
               applyButtonSx={styles.cropperApplyButton}
               data-testid="company-banner-cropper-dialog"
            />
         ) : null}
         <FileUploader {...bannerUploaderProps}>
            <Box
               sx={[
                  styles.companyBanner,
                  (bannerDragActive || !url) && styles.imageLabelVisible,
               ]}
            >
               <BannerPreview url={url} />
               <BannerUploadCTA url={url} />
            </Box>
         </FileUploader>
      </>
   )
}

const DefaultLabel: FC = () => {
   return (
      <>
         <Typography zIndex={1}>Recommended size: 2880x480px</Typography>
         <Button
            size="small"
            color="secondary"
            sx={styles.uploadPictureButton}
            variant="outlined"
            endIcon={<Upload size={18} />}
         >
            <Typography variant="body1">Upload picture</Typography>
         </Button>
      </>
   )
}

type BannerPreviewProps = {
   url: string
}

const BannerPreview: FC<BannerPreviewProps> = ({ url }) => {
   return (
      <Box className="banner-preview">
         <Box sx={styles.companyBannerUploadArea}>
            <BannerImage url={url} />
            {url ? null : <DefaultLabel />}
         </Box>
      </Box>
   )
}

const BannerImage: FC<BannerPreviewProps> = ({ url }) => {
   if (!url) return null

   return <Avatar src={url} alt="banner preview" sx={styles.bannerImage} />
}

const BannerUploadCTA: FC<BannerPreviewProps> = ({ url }) => {
   return (
      <Stack className="banner-upload-cta" sx={styles.companyBannerUploadArea}>
         <BannerImage url={url} />
         <Box sx={styles.greyOverlay} />
         <DefaultLabel />
      </Stack>
   )
}

export default CompanyBanner
