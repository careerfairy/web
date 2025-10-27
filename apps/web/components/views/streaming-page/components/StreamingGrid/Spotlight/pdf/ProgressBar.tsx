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

   // Show conversion state based on explicit status (these take precedence over upload progress)
   if (
      fileUpLoaded &&
      conversionStatus === PresentationConversionStatus.CONVERTING
   ) {
      const conversionPercentage = getConversionPercentage()

      return (
         <Stack sx={styles.root} direction="row" spacing={2}>
            <LinearProgress
               sx={styles.progress}
               variant="determinate"
               value={conversionPercentage}
            />
            <Typography variant="small" color="neutral.700">
               {conversionPercentage.toFixed(0)}%
            </Typography>
         </Stack>
      )
   }

   if (
      fileUpLoaded &&
      conversionStatus === PresentationConversionStatus.PENDING
   ) {
      return <LinearProgress sx={styles.progress} variant="indeterminate" />
   }

   // If no upload progress, don't show anything (unless we're in a conversion state above)
   if (!progress) {
      return null
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

   // Show success for completed presentations
   if (
      fileUpLoaded &&
      conversionStatus === PresentationConversionStatus.COMPLETED
   ) {
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
      return <LinearProgress sx={styles.progress} variant="indeterminate" />
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
