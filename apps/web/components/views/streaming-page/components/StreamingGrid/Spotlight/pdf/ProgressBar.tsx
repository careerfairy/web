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
}

export const ProgressBar = ({ progress, fileUpLoaded }: Props) => {
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
            sx={styles.root}
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
      <Stack sx={styles.root} direction="row" alignItems="center" spacing={2}>
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
