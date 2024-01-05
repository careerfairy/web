import {
   Box,
   LinearProgress,
   LinearProgressProps,
   linearProgressClasses,
} from "@mui/material"
import { combineStyles, sxStyles } from "types/commonTypes"
import { Check, X as Cross } from "react-feather"

const styles = sxStyles({
   progressBarWrapper: {
      width: "100%",
      position: "relative",
   },
   progressBar: {
      width: "100%",
      height: 7,
      borderRadius: 5,
      bgcolor: "grey.300",
      [`& .${linearProgressClasses.bar}`]: {
         borderRadius: 5,
      },
   },
   endIcon: {
      position: "absolute",
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
      width: 15,
      height: 15,
      bgcolor: "secondary.main",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& svg": {
         color: "common.white",
      },
   },
   endIconCritical: {
      bgcolor: "error.main",
   },
})

type Props = {
   value: number
   sx?: LinearProgressProps["sx"]
   critical?: boolean
}

const Progress = ({ critical, value, sx }: Props) => {
   const containedValue = value > 100 ? 100 : value

   const isFull = containedValue === 100

   return (
      <Box sx={combineStyles(styles.progressBarWrapper, sx)} component="span">
         <LinearProgress
            sx={styles.progressBar}
            color={critical ? "error" : "secondary"}
            variant="determinate"
            value={containedValue}
         />
         {isFull ? <EndIcon critical={critical} /> : null}
      </Box>
   )
}

type EndIconProps = {
   critical?: boolean
}
const iconProps = {
   strokeWidth: 5,
   size: 7,
} as const

const EndIcon = ({ critical }: EndIconProps) => {
   return (
      <Box sx={[styles.endIcon, critical && styles.endIconCritical]}>
         {critical ? <Cross {...iconProps} /> : <Check {...iconProps} />}
      </Box>
   )
}

export default Progress
