import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import TimeIcon from "@mui/icons-material/AccessTimeRounded"
import PhoneIcon from "@mui/icons-material/PhoneIphone"
import VideoFileIcon from "@mui/icons-material/VideoFileOutlined"
import { Box, Button, FormHelperText, Stack, Typography } from "@mui/material"
import useFileUploader from "components/custom-hook/useFileUploader"
import { getVideoFileDuration } from "components/helperFunctions/validators/video"
import FileUploader, {
   FileUploaderProps,
} from "components/views/common/FileUploader"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import { imagePlaceholder } from "constants/images"
import { FieldHelperProps, useField } from "formik"
import Image from "next/image"
import { FC, Fragment, ReactNode, useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import SparkVideoPreview from "./SparkVideoPreview"

const styles = sxStyles({
   root: {
      border: "1px dashed rgba(153, 153, 177, 0.30)",
      width: "100%",
      height: "100%",
      borderRadius: 2,
      "& label": {
         height: "inherit",
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         justifyContent: "center",
      },
      p: 3,
   },
   hovered: {
      border: "1px dashed rgba(153, 153, 177, 0.30)",
      backgroundColor: "rgba(153, 153, 177, 0.30)",
   },
   placeholderWrapper: {
      width: 124,
      height: 150,
      borderRadius: 1.5,
   },
   placeholderText: {
      color: "#7D7D7D",
      textAlign: "center",
      fontSize: "1rem",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "1.14286rem",
      whiteSpace: "nowrap",
   },
   uploadBtn: {
      whiteSpace: "nowrap",
      textTransform: "none",
   },
   videoSpecTextRoot: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#C3C3C3",
      "& svg": {
         color: "inherit",
         mr: 1,
      },
   },
   specText: {
      color: "inherit",
      fontSize: "0.85714rem",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "1.14286rem",
   },
})

type Props = {
   name: string
}

const maxSeconds = SPARK_CONSTANTS.MAX_DURATION_SECONDS
const minSeconds = SPARK_CONSTANTS.MIN_DURATION_SECONDS
const maxMinutes = Math.round(maxSeconds / 60)
const maxFileSize = SPARK_CONSTANTS.MAX_FILE_SIZE_MB

const VideoUpload: FC<Props> = ({ name }) => {
   const [field, meta, helpers] = useField<File>(name)

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: SPARK_CONSTANTS.ALLOWED_FILE_FORMATS,
      maxFileSize: maxFileSize, // MB
      multiple: false,
      onValidated: async (file) => {
         validateVideo(file, helpers)
      },
   })

   const blobUrl = useMemo(() => {
      if (field.value && !meta.error) {
         return URL.createObjectURL(field.value)
      }
   }, [field.value, meta.error])

   return (
      <Box display="flex" flexDirection="column" height="100%">
         {blobUrl ? (
            <SparkVideoPreview
               url={blobUrl}
               fileUploaderProps={fileUploaderProps}
            />
         ) : (
            <UploadPromptDisplay
               dragActive={dragActive}
               fileUploaderProps={fileUploaderProps}
            />
         )}
         {meta.touched && meta.error ? (
            <FormHelperText error>{meta.error}</FormHelperText>
         ) : null}
      </Box>
   )
}

type VideoSpecTextProps = {
   text: string
   icon: ReactNode
}

const VideoSpecText: FC<VideoSpecTextProps> = ({ icon, text }) => {
   return (
      <Box sx={styles.videoSpecTextRoot}>
         {icon}
         <Typography sx={styles.specText}>{text}</Typography>
      </Box>
   )
}

type UploadPromptDisplayProps = {
   fileUploaderProps: FileUploaderProps
   dragActive: boolean
}

const UploadPromptDisplay: FC<UploadPromptDisplayProps> = ({
   fileUploaderProps,
   dragActive,
}) => {
   return (
      <SparkAspectRatioBox sx={[styles.root, dragActive && styles.hovered]}>
         <FileUploader {...fileUploaderProps}>
            <Fragment>
               <Box sx={styles.placeholderWrapper}>
                  <Image
                     alt="placeholder"
                     src={imagePlaceholder}
                     width={124}
                     height={150}
                     objectFit="contain"
                  />
               </Box>
               <Typography mt={2} mb={1} sx={styles.placeholderText}>
                  Upload your Spark
               </Typography>
               <Button
                  sx={styles.uploadBtn}
                  color="secondary"
                  variant="contained"
                  size="small"
               >
                  Upload video
               </Button>

               <Stack spacing={1} mt={3}>
                  <VideoSpecText icon={<PhoneIcon />} text="9:16 format" />
                  <VideoSpecText
                     icon={<VideoFileIcon />}
                     text={`Max ${maxFileSize}MB`}
                  />
                  <VideoSpecText
                     icon={<TimeIcon />}
                     text={`Max ${maxMinutes} minute`}
                  />
               </Stack>
            </Fragment>
         </FileUploader>
      </SparkAspectRatioBox>
   )
}

const validateVideo = async (
   file: File | File[],
   helpers: FieldHelperProps<File>
) => {
   const newFile = Array.isArray(file) ? file[0] : file
   const duration = await getVideoFileDuration(newFile)

   if (duration < minSeconds || duration > maxSeconds) {
      const roundedDuration = Math.round(duration * 10) / 10 // round to 1 decimal

      const message = `Your video is ${roundedDuration} seconds long, a Spark should be between ${minSeconds} and ${maxSeconds} seconds`

      helpers.setValue(null, false) // set value to null but don't trigger validation because we already setting an error
      helpers.setError(message) // set error message
      helpers.setTouched(true, false) // set touched to true but don't trigger validation because we already set an error
   } else {
      helpers.setTouched(true)
      helpers.setValue(newFile)
   }
}

export default VideoUpload
