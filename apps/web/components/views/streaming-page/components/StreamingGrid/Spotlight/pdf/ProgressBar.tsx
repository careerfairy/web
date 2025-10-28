import { PresentationConversionStatus } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   LinearProgress,
   Stack,
   Typography,
   linearProgressClasses,
} from "@mui/material"
import { CheckCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      display: "flex",
      alignItems: "center",
      height: 20,
      justifyContent: "center",
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
})

type Props = {
   progress: number
   fileUpLoaded: boolean
   conversionStatus?: PresentationConversionStatus
   convertedPages?: number
   totalPages?: number
}

export const UploadProgressBar = ({
   progress,
   fileUpLoaded,
   conversionStatus,
   convertedPages,
   totalPages,
}: Props) => {
   // Calculate conversion progress percentage
   const getConversionPercentage = (): number => {
      if (
         convertedPages === undefined ||
         totalPages === undefined ||
         totalPages === 0
      )
         return 0
      return (convertedPages / totalPages) * 100
   }

   // CONVERTING: always show indeterminate loader (PDF to PNG conversion)
   if (conversionStatus === PresentationConversionStatus.CONVERTING) {
      return (
         <Stack sx={styles.root} direction="row" spacing={2}>
            <LinearProgress sx={styles.progress} variant="indeterminate" />
         </Stack>
      )
   }

   // UPLOADING: show progress bar with percentage
   if (conversionStatus === PresentationConversionStatus.UPLOADING) {
      const uploadPercentage = getConversionPercentage()

      return (
         <Stack sx={styles.root} direction="row" spacing={2}>
            <LinearProgress
               sx={styles.progress}
               variant="determinate"
               value={uploadPercentage}
            />
            <Typography variant="small" color="neutral.700">
               {uploadPercentage.toFixed(0)}%
            </Typography>
         </Stack>
      )
   }

   // PENDING: show indeterminate loader
   if (conversionStatus === PresentationConversionStatus.PENDING) {
      return (
         <Stack sx={styles.root} direction="row" spacing={2}>
            <LinearProgress sx={styles.progress} variant="indeterminate" />
         </Stack>
      )
   }

   // FAILED: show error message
   if (conversionStatus === PresentationConversionStatus.FAILED) {
      return (
         <Stack direction="row" spacing={1} sx={styles.root}>
            <Typography variant="xsmall" color="error.main">
               Conversion failed - using PDF fallback
            </Typography>
         </Stack>
      )
   }

   // COMPLETED: show success message
   if (conversionStatus === PresentationConversionStatus.COMPLETED) {
      return (
         <Stack direction="row" spacing={1} sx={styles.root}>
            <Box sx={styles.checkCircle} component={CheckCircle} />
            <Typography
               sx={styles.uploadedText}
               variant="xsmall"
               color="neutral.700"
            >
               Ready to share
            </Typography>
         </Stack>
      )
   }

   // If file is uploaded but no conversion status yet (waiting for backend to start conversion)
   // Show indeterminate progress to bridge the gap between upload and conversion
   if (fileUpLoaded && !conversionStatus) {
      return (
         <Stack sx={styles.root} direction="row" spacing={2}>
            <LinearProgress sx={styles.progress} variant="indeterminate" />
         </Stack>
      )
   }

   // Default: Show upload progress or indeterminate loader
   if (!progress) {
      return (
         <Stack sx={styles.root} direction="row" spacing={2}>
            <LinearProgress sx={styles.progress} variant="indeterminate" />
         </Stack>
      )
   }

   return (
      <Stack sx={styles.root} direction="row" spacing={2}>
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
