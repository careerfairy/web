import React, { FC, useState } from "react"
import { useTheme } from "@mui/material/styles"
import MobileStepper from "@mui/material/MobileStepper"
import SwipeableViews from "react-swipeable-views"
import { sxStyles } from "types/commonTypes"
import { TabPanel } from "materialUI/GlobalPanels/GlobalPanels"

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
   onStepChange?: (step: number) => void
   steps: React.ReactNode[]
}

const BrandedSwipeableViews: FC<BrandedSwipeableViewsProps> = ({
   onStepChange,
   steps,
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
            {steps.map((step, index) => (
               <TabPanel key={index} value={index} activeValue={activeStep}>
                  {step}
               </TabPanel>
            ))}
         </SwipeableViews>
         <MobileStepper
            position="static"
            steps={steps.length}
            activeStep={activeStep}
            backButton={null}
            nextButton={null}
            sx={styles.stepper}
         />
      </>
   )
}

export default BrandedSwipeableViews
