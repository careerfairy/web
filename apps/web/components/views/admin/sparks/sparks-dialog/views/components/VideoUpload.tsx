import TimeIcon from "@mui/icons-material/AccessTimeRounded"
import PhoneIcon from "@mui/icons-material/PhoneIphone"
import VideoFileIcon from "@mui/icons-material/VideoFileOutlined"
import { Box, Button, FormHelperText, Stack, Typography } from "@mui/material"
import useFileUploader from "components/custom-hook/useFileUploader"
import FileUploader from "components/views/common/FileUploader"
import SparkAspectRatioBox from "components/views/sparks/components/SparkAspectRatioBox"
import { imagePlaceholder } from "constants/images"
import { useField } from "formik"
import Image from "next/image"
import { FC, ReactNode, useCallback, useMemo } from "react"
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

const VideoUpload: FC<Props> = ({ name }) => {
   const [field, meta, helpers] = useField<File>(name)

   const { fileUploaderProps, dragActive } = useFileUploader({
      acceptedFileTypes: ["mp4", "webm"],
      maxFileSize: 150, // MB
      multiple: false,
      onValidated: (file) => {
         const newFile = Array.isArray(file) ? file[0] : file

         helpers.setValue(newFile)
         handleTouched()
      },
   })

   const handleTouched = useCallback(() => {
      helpers.setTouched(true, false)
   }, [helpers])

   const blobUrl = useMemo(() => {
      if (field.value && !meta.error) {
         return URL.createObjectURL(field.value)
      }
   }, [field.value, meta.error])

   return (
      <Box>
         {blobUrl ? (
            <SparkVideoPreview
               url={blobUrl}
               fileUploaderProps={fileUploaderProps}
            />
         ) : (
            <SparkAspectRatioBox
               sx={[styles.root, dragActive && styles.hovered]}
            >
               <FileUploader {...fileUploaderProps}>
                  <UploadPromptDisplay />
               </FileUploader>
            </SparkAspectRatioBox>
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

export default VideoUpload

const UploadPromptDisplay: FC = () => {
   return (
      <>
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
            <VideoSpecText icon={<VideoFileIcon />} text="Max 150MB" />
            <VideoSpecText icon={<TimeIcon />} text="Max 1 minute" />
         </Stack>
      </>
   )
}
