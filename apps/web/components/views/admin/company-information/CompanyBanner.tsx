import { BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Avatar, Box, Button, Stack, Typography } from "@mui/material"
import useUploadGroupBanner from "components/custom-hook/group/useUploadGroupBanner"
import useFileUploader from "components/custom-hook/useFileUploader"
import FileUploader from "components/views/common/FileUploader"
import { getImageDimensionsValidator } from "components/views/common/FileUploader/validations"
import ImageCropperDialog from "components/views/common/ImageCropperDialog"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import { FC, useState, useCallback } from "react"
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
})

type CompanyBannerProps = {
   url: string
   groupId: string
}

const bannerImageValidator = getImageDimensionsValidator({
   maxHeight: BANNER_IMAGE_SPECS.maxHeight,
   maxWidth: BANNER_IMAGE_SPECS.maxWidth,
   minHeight: BANNER_IMAGE_SPECS.minHeight,
   minWidth: BANNER_IMAGE_SPECS.minWidth,
})

const CompanyBanner: FC<CompanyBannerProps> = ({ url, groupId }) => {
   const { handleUploadImage: handleUploadBanner } =
      useUploadGroupBanner(groupId)
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const [objectUrl, setObjectUrl] = useState<string | null>(null)
   
   console.log("CompanyBanner render - objectUrl:", objectUrl)

   const setImage = (file, imageSetter) => {
      console.log("setImage called with file:", file)
      const newFile = Array.isArray(file) ? file[0] : file
      console.log("Creating object URL for file:", newFile)
      const objectURL = URL.createObjectURL(newFile)
      console.log("Object URL created:", objectURL)
      imageSetter(objectURL)
   }

   const {
      fileUploaderProps: bannerUploaderProps,
      dragActive: bannerDragActive,
   } = useFileUploader({
      acceptedFileTypes: BANNER_IMAGE_SPECS.allowedFormats,
      maxFileSize: BANNER_IMAGE_SPECS.maxSize, // Use the spec value
      multiple: false,
      onValidated: (file) => {
         console.log("onValidated callback triggered with file:", file)
         setImage(file, setObjectUrl)
      },
      // Temporarily remove custom validation to debug
      // customValidations: [bannerImageValidator],
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
         } catch (error) {
            errorNotification(error.message || "Failed to upload banner image")
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
               aspectRatio={6 / 1} // Banner aspect ratio (2880x480 ≈ 6:1)
               titleIcon={<Upload />}
               backButtonText="Cancel"
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
         <Typography zIndex={1}>Recommended size: 2880x576px</Typography>
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
