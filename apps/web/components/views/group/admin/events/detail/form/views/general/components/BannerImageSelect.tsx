import {
   Box,
   Button,
   Collapse,
   FormHelperText,
   Stack,
   Typography,
} from "@mui/material"
import useFileUploader from "components/custom-hook/useFileUploader"
import useIsMobile from "components/custom-hook/useIsMobile"
import { uploadLogo } from "components/helperFunctions/HelperFunctions"
import { getDownloadUrl } from "components/helperFunctions/streamFormFunctions"
import FileUploader from "components/views/common/FileUploader"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useField } from "formik"
import { useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import { UploadIcon } from "./UploadIcon"

const PLACEHOLDER_BANNER_URL =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Flivestream_creation_banner_placeholder.png?alt=media&token=e12cc34a-44e5-4c00-8ac5-ed6ec232bc69"

const styles = sxStyles({
   placeholderLogoContainer: {
      height: "111px",
   },
   label: {
      color: "#212020",
      lineHeight: "24px",
      fontSize: {
         xs: "13px",
         sm: "16px",
      },
      textAlign: "center",
   },
   recommendedSize: {
      color: "#9C9C9C",
      lineHeight: "16px",
      fontSize: {
         xs: "10px",
         sm: "12px",
      },
      textAlign: "center",
   },
   fileUploaderButton: {
      padding: "4px 16px",
      "&:hover": {
         backgroundColor: "#6749EA !important",
         color: "#FEFEFE !important",
      },
   },
   changeBannerButtonWrapper: {
      position: "absolute",
      top: "18px",
      right: "18px",
   },
   dragAndDropView: {
      position: "absolute",
      top: 0,
      left: 0,
      margin: "0px !important",
      width: "100%",
      height: "100%",
      borderRadius: "16px",
      border: "1px solid #6749EA",
      background: "rgba(240, 237, 253, 0.90)",
      zIndex: 1,
      alignItems: "center",
      justifyContent: "center",
   },
   dragAndDropViewLabel: {
      fontSize: "24px",
      fontStyle: "normal",
      fontWeight: 600,
      lineHeight: "36px",
      color: "neutral.700",
   },
   dragAndDropViewIcon: {
      width: "64px",
      height: "64px",
   },
   fileUploader: {
      width: "100%",
      height: "100%",
   },
   errorMessage: {
      gridColumn: 2,
      textAlignLast: "center",
   },
   bannerImage: {
      borderRadius: "18px",
      padding: "10px",
      width: "100%",
      height: "100%",
      margin: 0,
      objectFit: "cover",
      objectPosition: "center",
   },
   emptyBannerWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      gap: "12px",
   },
})

const getStyles = (hasError: boolean) =>
   sxStyles({
      root: {
         position: "relative",
         height: {
            xs: "275px",
            md: "429px",
         },
         alignItems: "center",
         justifyContent: "center",
         border: `1px solid ${hasError ? "#FF1616" : "#EBEBEF"}`,
         borderRadius: "16px",
      },
      ...styles,
   })

const FIELD_NAME = "general.backgroundImageUrl"

const DragAndDropView = () => {
   return (
      <Stack spacing="12px" sx={styles.dragAndDropView}>
         <UploadIcon sx={styles.dragAndDropViewIcon} />
         <Typography sx={styles.dragAndDropViewLabel}>
            Drop your file to upload
         </Typography>
      </Stack>
   )
}

type FileUploaderButtonProps = {
   buttonLabel: string
   hideIcon?: boolean
}

const FileUploaderButton = ({
   buttonLabel,
   hideIcon = false,
}: FileUploaderButtonProps) => {
   const isMobile = useIsMobile()

   return (
      <>
         <Button
            endIcon={hideIcon ? null : <UploadIcon />}
            size={isMobile ? "small" : "medium"}
            variant="outlined"
            color="secondary"
            sx={styles.fileUploaderButton}
         >
            <Typography>{buttonLabel}</Typography>
         </Button>
      </>
   )
}

const EmptyBanner = () => {
   return (
      <Box sx={styles.emptyBannerWrapper}>
         <Box sx={styles.placeholderLogoContainer}>
            <Box
               component="img"
               src={PLACEHOLDER_BANNER_URL}
               alt="Upload Banner"
            />
         </Box>
         <Box>
            <Typography sx={styles.label}>
               Upload your live stream banner image
            </Typography>
            <Typography sx={styles.recommendedSize}>
               Recommended size: 1920x1080
            </Typography>
         </Box>
         <FileUploaderButton buttonLabel="Upload banner" />
      </Box>
   )
}

type BannerWithImage = {
   imageUrl: string
}

const BannerWithImage = ({ imageUrl }: BannerWithImage) => {
   return (
      <>
         <Box sx={styles.changeBannerButtonWrapper}>
            <FileUploaderButton buttonLabel="Change banner" hideIcon={true} />
         </Box>
         <Box
            component="img"
            src={imageUrl}
            alt="Banner"
            sx={styles.bannerImage}
         />
      </>
   )
}

const BannerImageSelect = () => {
   const firebase = useFirebaseService()
   const [field, meta, helpers] = useField(FIELD_NAME)

   const handleTouched = useCallback(() => {
      helpers.setTouched(true, false)
   }, [helpers])

   const { fileUploaderProps, dragActive } = useFileUploader({
      name: "general.backgroundImageUrl",
      acceptedFileTypes: ["png", "jpeg", "jpg", "PNG", "JPEG", "JPG"],
      maxFileSize: 10, // MB
      multiple: false,
      onValidated: async (file) => {
         const newFile = Array.isArray(file) ? file[0] : file
         await uploadLogo(
            "illustration-images",
            newFile,
            firebase,
            async (newUrl, fullPath) => {
               await helpers.setValue(getDownloadUrl(fullPath), true)
               handleTouched()
               await helpers.setError(undefined)
            },
            () => {}
         )
      },
      onCancel: async () => {
         handleTouched()
         await helpers.setError("Please provide a banner image")
      },
   })

   const styles = getStyles(Boolean(meta.touched && meta.error))

   return (
      <>
         <Stack spacing="10px" direction="column" sx={styles.root}>
            <FileUploader {...fileUploaderProps} sx={styles.fileUploader}>
               <>
                  {field.value ? (
                     <BannerWithImage imageUrl={field.value} />
                  ) : (
                     <EmptyBanner />
                  )}
                  {dragActive ? <DragAndDropView /> : null}
               </>
            </FileUploader>
         </Stack>
         <Collapse
            in={Boolean(meta.touched && meta.error)}
            sx={styles.errorMessage}
         >
            <FormHelperText error>{meta.error}</FormHelperText>
         </Collapse>
      </>
   )
}

export default BannerImageSelect
