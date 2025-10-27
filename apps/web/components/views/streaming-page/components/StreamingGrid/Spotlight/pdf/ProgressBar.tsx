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
   conversionProgress?: string
}

export const UploadProgressBar = ({
   progress,
   fileUpLoaded,
   conversionStatus,
   conversionProgress,
}: Props) => {
   if (!progress) {
      return null
   }

   // Show conversion state based on explicit status
   if (
      fileUpLoaded &&
      conversionStatus === PresentationConversionStatus.CONVERTING
   ) {
      return (
         <Stack sx={styles.root} direction="row" spacing={2}>
            <LinearProgress sx={styles.progress} variant="indeterminate" />
            <Typography variant="small" color="neutral.700">
               Converting to high-quality images
               {conversionProgress ? ` (${conversionProgress})` : "..."}
            </Typography>
         </Stack>
      )
   }

   if (
      fileUpLoaded &&
      conversionStatus === PresentationConversionStatus.PENDING
   ) {
      return (
         <Stack sx={styles.root} direction="row" spacing={2}>
            <LinearProgress sx={styles.progress} variant="indeterminate" />
            <Typography variant="small" color="neutral.700">
               Preparing to convert...
            </Typography>
         </Stack>
      )
   }

   if (
      fileUpLoaded &&
      conversionStatus === PresentationConversionStatus.FAILED
   ) {
      return (
         <Stack direction="row" spacing={1} sx={styles.root}>
            <Typography variant="xsmall" color="error.main">
               Conversion failed - using PDF fallback
            </Typography>
         </Stack>
      )
   }

   // Show success for completed or legacy presentations (no status = old upload)
   if (fileUpLoaded) {
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
