import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { SparkVideo } from "@careerfairy/shared-lib/sparks/sparks"
import TimeIcon from "@mui/icons-material/AccessTimeRounded"
import PhoneIcon from "@mui/icons-material/PhoneIphone"
import VideoFileIcon from "@mui/icons-material/VideoFileOutlined"
import { Box, Button, FormHelperText, Stack, Typography } from "@mui/material"
import useUploadSparkThumbnail from "components/custom-hook/spark/useUploadSparkThumbnail"
import useUploadSparkVideo from "components/custom-hook/spark/useUploadSparkVideo"
import useFileUploader from "components/custom-hook/useFileUploader"
import useFirebaseDelete from "components/custom-hook/utils/useFirebaseDelete"
import { dataURLtoFile } from "components/helperFunctions/HelperFunctions"
import {
   generateVideoThumbnails,
   getVideoDurationFromVideoFile,
} from "components/util/video"
import FileUploader, {
   FileUploaderProps,
} from "components/views/common/FileUploader"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import { imagePlaceholder } from "constants/images"
import { useField } from "formik"
import Image from "next/image"
import { FC, Fragment, ReactNode, useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import SparkVideoPreview from "./SparkVideoPreview"
import UploadOverlay from "./UploadOverlay"

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
   editing: boolean
}

const maxSeconds = SPARK_CONSTANTS.MAX_DURATION_SECONDS
const minSeconds = SPARK_CONSTANTS.MIN_DURATION_SECONDS
const maxMinutes = Math.round(maxSeconds / 60)
const maxFileSize = SPARK_CONSTANTS.MAX_FILE_SIZE_MB

const VideoUpload: FC<Props> = ({ name, editing }) => {
   const {
      handleUploadFile: uploadVideo,
      progress: videoUploadProgress,
      uploading: videoUploading,
      isLoading: videoIsLoading,
   } = useUploadSparkVideo()

   const {
      handleUploadFile: uploadThumbnail,
      progress: thumbnailUploadProgress,
      uploading: thumbnailUploading,
      isLoading: thumbnailIsLoading,
   } = useUploadSparkThumbnail()

   const [deleteFiles] = useFirebaseDelete()

   const [field, meta, helpers] = useField<SparkVideo>(name)

   const handleError = useCallback(
      (message: string) => {
         helpers.setValue(null, false) // set value to null but don't trigger validation because we already setting an error
         helpers.setError(message) // set error message
         helpers.setTouched(true, false) // set touched to true but don't trigger validation because we already set an error
      },
      [helpers]
   )

   const validateVideo = useCallback(
      async (file: File | File[]) => {
         const newFile = Array.isArray(file) ? file[0] : file

         let duration
         try {
            duration = await getVideoDurationFromVideoFile(newFile)
         } catch (error) {
            handleError("Error getting video duration")
            return
         }

         if (duration < minSeconds || duration > maxSeconds) {
            const roundedDuration = Math.round(duration * 10) / 10 // round to 1 decimal
            const message = `Your video is ${roundedDuration} seconds long, a Spark should be between ${minSeconds} and ${maxSeconds} seconds`

            handleError(message)
            return
         }

         if (!editing && field.value) {
            // Delete existing video and thumbnail before uploading the new ones
            // Don't await because we don't want to wait for the delete to finish before uploading the new ones
            deleteFiles([field.value.url, field.value.thumbnailUrl]).catch(
               console.error
            )
         }

         let videoData,
            thumbnailsInBase64,
            thumbnail64,
            thumbnailFile,
            thumbnailData

         try {
            // upload file
            videoData = await uploadVideo(newFile)
         } catch (error) {
            handleError("Error uploading video")
            return
         }

         try {
            thumbnailsInBase64 = await generateVideoThumbnails(newFile, 1)
            thumbnail64 = thumbnailsInBase64[0]
            thumbnailFile = dataURLtoFile(thumbnail64)
         } catch (error) {
            handleError("Error generating video thumbnails")
            return
         }

         try {
            // upload thumbnail
            thumbnailData = await uploadThumbnail(thumbnailFile)
         } catch (error) {
            handleError("Error uploading video thumbnail")
            return
         }

         helpers.setTouched(true)

         const newValue: SparkVideo = {
            uid: videoData.uid,
            url: videoData.url,
            fileExtension: videoData.fileExtension,
            thumbnailUrl: thumbnailData.url,
         }
         helpers.setValue(newValue)
      },
      [
         editing,
         field.value,
         helpers,
         handleError,
         deleteFiles,
         uploadVideo,
         uploadThumbnail,
      ]
   )

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: SPARK_CONSTANTS.ALLOWED_FILE_FORMATS,
      maxFileSize: maxFileSize, // MB
      multiple: false,
      onValidated: validateVideo,
   })

   // You can't edit the video of an existing Spark
   if (editing) {
      return (
         <SparkVideoPreview
            url={field.value.url}
            thumbnailUrl={field.value.thumbnailUrl}
         />
      )
   }

   return (
      <Box display="flex" flexDirection="column" height="100%">
         {thumbnailIsLoading ? (
            <SparkAspectRatioBox sx={styles.root}>
               <UploadOverlay
                  progress={thumbnailUploadProgress}
                  uploading={thumbnailUploading}
                  name={"thumbnail"}
               />
            </SparkAspectRatioBox>
         ) : videoIsLoading ? (
            <SparkAspectRatioBox sx={styles.root}>
               <UploadOverlay
                  progress={videoUploadProgress}
                  uploading={videoUploading}
                  name={"video"}
               />
            </SparkAspectRatioBox>
         ) : field.value ? (
            <SparkVideoPreview
               url={field.value.url}
               fileUploaderProps={fileUploaderProps}
               thumbnailUrl={field.value.thumbnailUrl}
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

export default VideoUpload
