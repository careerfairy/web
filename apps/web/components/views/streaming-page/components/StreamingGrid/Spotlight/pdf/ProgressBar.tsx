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
   fileUpLoaded: _fileUpLoaded,
   conversionStatus,
   convertedPages,
   totalPages,
}: Props) => {
   // Map the entire process to a single 0-100% progress bar
   // 0-30%: PDF upload (PENDING)
   // 30-40%: PDF parsing and conversion setup (CONVERTING)
   // 40-95%: Image conversion and upload (UPLOADING)
   // 100%: Complete (COMPLETED)

   const getOverallProgress = (): number => {
      // PENDING: Uploading original PDF (0-30%)
      if (conversionStatus === PresentationConversionStatus.PENDING) {
         return progress ? progress * 0.3 : 0
      }

      // CONVERTING: PDF parsing and setup (30-40%)
      if (conversionStatus === PresentationConversionStatus.CONVERTING) {
         return 35
      }

      // UPLOADING: Converting and uploading images (40-95%)
      if (conversionStatus === PresentationConversionStatus.UPLOADING) {
         if (convertedPages !== undefined && totalPages && totalPages > 0) {
            const imageProgress = (convertedPages / totalPages) * 55 // 55% of total range
            return 40 + imageProgress
         }
         return 40
      }

      // COMPLETED: Done (100%)
      if (conversionStatus === PresentationConversionStatus.COMPLETED) {
         return 100
      }

      // FAILED: Show error state
      if (conversionStatus === PresentationConversionStatus.FAILED) {
         return 0
      }

      // Fallback
      return progress || 0
   }

   const overallProgress = getOverallProgress()

   // FAILED: show error message
   if (conversionStatus === PresentationConversionStatus.FAILED) {
      return (
         <Stack direction="row" spacing={1} sx={styles.root}>
            <Typography variant="xsmall" color="error.main">
               Upload failed
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

   // Single progress bar for all stages
   return (
      <Stack sx={styles.root} direction="row" spacing={2}>
         <LinearProgress
            sx={styles.progress}
            variant="determinate"
            value={overallProgress}
         />
         <Typography variant="small" color="neutral.700">
            {overallProgress.toFixed(0)}%
         </Typography>
      </Stack>
   )
}
