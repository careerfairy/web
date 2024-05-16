import { LivestreamPresentation } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   IconButton,
   LinearProgress,
   Stack,
   Typography,
   linearProgressClasses,
} from "@mui/material"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"
import { forwardRef, useMemo } from "react"
import {
   CheckCircle,
   Trash2 as DeleteIcon,
   File as FileIcon,
} from "react-feather"
import { sxStyles } from "types/commonTypes"
import { PDFPreviewSkeleton } from "./PDFPreviewSkeleton"

const styles = sxStyles({
   root: {
      p: 1.5,
      width: "100%",
      justifyContent: "flex-start",
      position: "relative",
   },
   iconWrapper: {
      borderRadius: "50%",
      background: (theme) => theme.brand.white[500],
      border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      width: 41,
      height: 41,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "& svg": {
         color: "#7A7A8E",
         width: 25.625,
         height: 25.625,
      },
   },
   progress: {
      flex: 1,
      backgroundColor: (theme) => theme.brand.black[400],
      borderRadius: "6px",
      [`& .${linearProgressClasses.bar}`]: {
         borderRadius: "6px",
      },
   },
   uploadedText: {
      textAlign: "center",
      display: "flex",
      alignItems: "center",
   },
   checkCircle: {
      width: 14,
      height: 14,
      color: "success.700",
   },
   deleteButton: {
      position: "absolute",
      top: 0,
      right: 0,
      p: 0.8,
      "& button": {
         p: 0.5,
         m: -0.5,
      },
      "& svg": {
         width: 20,
         height: 20,
      },
   },
   progressBarContainer: {
      display: "flex",
      alignItems: "center",
      height: 20,
      justifyContent: "center",
   },
   fileName: {
      ...getMaxLineStyles(1),
      wordBreak: "break-word",
      pr: 3,
   },
})

type Props = {
   data: LivestreamPresentation | File
   uploadProgress: number
   fileUpLoaded: boolean
   isDeleting: boolean
   handleDelete: () => void
}

const getDetails = (data: File | LivestreamPresentation) => {
   if (!data) {
      return null
   }
   if (data instanceof File) {
      return {
         fileName: data.name,
         fileSize: data.size / 1024 / 1024,
         downloadUrl: URL.createObjectURL(data),
      }
   } else {
      return {
         fileName: data.fileName,
         fileSize: Number.isFinite(data.fileSize)
            ? data.fileSize / 1024 / 1024
            : 0,
         downloadUrl: data.downloadUrl,
      }
   }
}

export const PDFPreview = forwardRef<HTMLDivElement, Props>(
   ({ data, uploadProgress, fileUpLoaded, isDeleting, handleDelete }, ref) => {
      const details = useMemo(() => getDetails(data), [data])

      if (!details) {
         return <PDFPreviewSkeleton />
      }

      return (
         <Box ref={ref} sx={styles.root}>
            <Stack width="100%" spacing={1}>
               <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  href={details.downloadUrl}
                  download={details.fileName}
                  target="_blank"
                  component="a"
               >
                  <Box sx={styles.iconWrapper}>
                     <FileIcon />
                  </Box>
                  <Stack alignItems="flex-start">
                     <Typography
                        variant="medium"
                        sx={styles.fileName}
                        color="neutral.700"
                     >
                        {details.fileName}
                     </Typography>
                     <Typography variant="xsmall" color="neutral.400">
                        {details.fileSize.toFixed(2)} MB
                     </Typography>
                  </Stack>
               </Stack>
               <ProgressBar
                  progress={uploadProgress}
                  fileUpLoaded={fileUpLoaded}
               />
            </Stack>
            <Box sx={styles.deleteButton}>
               <IconButton onClick={handleDelete} disabled={isDeleting}>
                  <DeleteIcon />
               </IconButton>
            </Box>
         </Box>
      )
   }
)

PDFPreview.displayName = "PDFPreview"

type ProgressBarProps = {
   progress: number
   fileUpLoaded: boolean
}

const ProgressBar = ({ progress, fileUpLoaded }: ProgressBarProps) => {
   if (!progress) {
      return null
   }

   if (fileUpLoaded) {
      return (
         <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={styles.progressBarContainer}
         >
            <Box sx={styles.checkCircle} component={CheckCircle} />
            <Typography
               sx={styles.uploadedText}
               variant="xsmall"
               color="neutral.700"
            >
               File uploaded
            </Typography>
         </Stack>
      )
   }

   return (
      <Stack
         sx={styles.progressBarContainer}
         direction="row"
         alignItems="center"
         spacing={2}
      >
         <LinearProgress
            sx={styles.progress}
            variant="determinate"
            value={progress}
         />
         <Typography variant="small" color="neutral.700">
            {progress.toFixed(0)}%
         </Typography>
      </Stack>
   )
}
