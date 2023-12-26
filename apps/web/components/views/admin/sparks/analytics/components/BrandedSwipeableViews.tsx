import React, { FC, useState } from "react"
import { useTheme } from "@mui/material/styles"
import MobileStepper from "@mui/material/MobileStepper"
import SwipeableViews from "react-swipeable-views"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   stepper: {
      backgroundColor: "initial",
      justifyContent: "center",
      "& .MuiMobileStepper-dot": {
         backgroundColor: "#EEEEEE",
      },
      "& .MuiMobileStepper-dotActive": {
         backgroundColor: "#8E8E8E",
      },
   },
})

type BrandedSwipeableViewsProps = {
   children: React.ReactNode
   onStepChange?: (step: number) => void
}

const BrandedSwipeableViews: FC<BrandedSwipeableViewsProps> = ({
   children,
   onStepChange,
}) => {
   const theme = useTheme()
   const [activeStep, setActiveStep] = useState(0)

   const handleStepChange = (step: number) => {
      if (onStepChange) {
         onStepChange(step)
      }
      setActiveStep(step)
   }

   return (
      <>
         <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
         >
            {children}
         </SwipeableViews>
         <MobileStepper
            position="static"
            steps={React.Children.toArray(children).length}
            activeStep={activeStep}
            backButton={null}
            nextButton={null}
            sx={styles.stepper}
         />
      </>
   )
}

export default BrandedSwipeableViews
