import {
   Box,
   Button,
   ButtonProps,
   Typography,
   TypographyProps,
} from "@mui/material"
import { combineStyles, sxStyles } from "types/commonTypes"
import { useOnboarding } from "./OnboardingProvider"

const styles = sxStyles({
   root: {
      minHeight: {
         xs: "auto",
         sm: 432,
      },
      display: "flex",
      flexGrow: 1,
      justifyContent: "center",
   },
   title: {
      fontSize: "1.741rem",
      fontWeight: 700,
   },
   button: {
      textTransform: "none",
      height: 40,
   },
})

const TimelineView = () => {
   const { activeStep, steps } = useOnboarding()
   return <Box sx={styles.root}>{steps[activeStep].view}</Box>
}

const Title = (props: TypographyProps) => (
   <Typography fontSize="1.741rem" fontWeight={700} {...props} />
)

const Description = (props: TypographyProps) => (
   <Typography
      fontSize="1.142rem"
      fontWeight={400}
      color="#3D3D47"
      {...props}
   />
)

const TimelineButton = (props: ButtonProps) => (
   <Button
      sx={combineStyles(styles.button, props.sx)}
      size="medium"
      {...props}
   />
)

TimelineView.Title = Title
TimelineView.Description = Description
TimelineView.Button = TimelineButton

export default TimelineView
