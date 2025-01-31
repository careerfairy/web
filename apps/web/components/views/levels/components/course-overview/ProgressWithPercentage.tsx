import {
   Box,
   CircularProgress,
   Typography,
   circularProgressClasses,
} from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "relative",
      display: "inline-flex",
   },
   label: {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      position: "absolute",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   percentage: {
      color: "neutral.200",
      fontSize: "12px",
      fontWeight: 800,
      lineHeight: "16px",
   },
   percentageOverlay: {
      color: (theme) => theme.palette.common.white,
      fontSize: "10px",
   },
   backgroundCircle: {
      color: "neutral.50",
      position: "absolute",
   },
   progressCircle: {
      position: "relative",
      color: "primary.main",
      [`& .${circularProgressClasses.circle}`]: {
         strokeLinecap: "round",
      },
   },
})

const defaultProps = {
   size: 48,
   thickness: 4,
   variant: "determinate" as const,
}

type Props = {
   percentageComplete: number
   isOverlay?: boolean
}

export const ProgressWithPercentage = ({
   percentageComplete,
   isOverlay,
}: Props) => {
   return (
      <Box sx={styles.root}>
         <CircularProgress
            {...defaultProps}
            sx={styles.backgroundCircle}
            value={100}
         />
         <CircularProgress
            {...defaultProps}
            sx={styles.progressCircle}
            value={percentageComplete}
         />
         <Box sx={styles.label}>
            <Typography
               variant="caption"
               component="div"
               sx={[styles.percentage, isOverlay && styles.percentageOverlay]}
            >{`${Math.round(percentageComplete)}%`}</Typography>
         </Box>
      </Box>
   )
}
