import { BANNER_IMAGE_SPECS } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Box, BoxProps, Button, Stack, Typography } from "@mui/material"
import useUploadGroupBanner from "components/custom-hook/group/useUploadGroupBanner"
import useFileUploader from "components/custom-hook/useFileUploader"
import FileUploader from "components/views/common/FileUploader"
import { getImageDimensionsValidator } from "components/views/common/FileUploader/validations"
import { FC } from "react"
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
      backgroundSize: "auto 150% !important",
      backgroundPosition: "center !important",
      backgroundRepeat: "no-repeat !important",
      color: "#9999B1",
      fontSize: "0.85714rem",
      fontWeight: 300,
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
      height: 124,
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

   const {
      fileUploaderProps: bannerUploaderProps,
      dragActive: bannerDragActive,
   } = useFileUploader({
      acceptedFileTypes: BANNER_IMAGE_SPECS.allowedFormats,
      maxFileSize: 10, // MB
      multiple: false,
      onValidated: (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         return handleUploadBanner(newFile)
      },
      customValidations: [bannerImageValidator],
   })

   return (
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
   )
}

type DefaultLabelProps = {
   sx: BoxProps["sx"]
}

const DefaultLabel: FC<DefaultLabelProps> = ({ sx }) => {
   return (
      <>
         <Typography>Recommended size: 2880x576px</Typography>
         <Button
            size="small"
            color="secondary"
            sx={sx}
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
         <Box
            sx={[
               styles.companyBannerUploadArea,
               url && {
                  background: `url(${url})`,
               },
            ]}
         >
            {url ? null : <DefaultLabel sx={styles.uploadPictureButton} />}
         </Box>
      </Box>
   )
}

const BannerUploadCTA: FC<BannerPreviewProps> = ({ url }) => {
   return (
      <Stack
         className="banner-upload-cta"
         sx={[
            styles.companyBannerUploadArea,
            {
               background: `linear-gradient(0deg, rgba(247, 248, 252, 0.96) 0%, rgba(247, 248, 252, 0.96) 100%), url(${url}), lightgray 50% / cover no-repeat`,
            },
         ]}
      >
         <DefaultLabel sx={styles.uploadPictureButton} />
      </Stack>
   )
}

export default CompanyBanner
