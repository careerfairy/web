import { Dialog, DialogContent, useTheme } from "@mui/material"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import SwipeableViews from "react-swipeable-views"

import {
   createContext,
   ComponentType,
   useContext,
   useState,
   useCallback,
   useMemo,
} from "react"
import { sxStyles } from "types/commonTypes"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SlideLeftTransition, SlideUpTransition } from "../common/transitions"

const styles = sxStyles({
   swipeableViews: {
      height: "100%",
   },
   slide: {
      overflow: "overlay",
   },
   swipeableViewsContainer: {
      height: "100%",
      "& > *": {
         height: "100%",
      },
   },
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      borderRadius: {
         md: 5,
      },
      maxWidth: 915,
      height: "100%",
   },
})

interface View {
   key: string
   Component: ComponentType<{}>
}

interface StepperDialogProps {
   handleClose: () => void
   open: boolean
   views: ReadonlyArray<View>
}

interface StepperContextValue<K extends string> {
   currentStep: number
   moveToNext: () => void
   moveToPrev: () => void
   goToStep: (key: K) => void
}

const StepperContext = createContext<StepperContextValue<any> | undefined>(
   undefined
)

export const useStepper = <K extends string>() => {
   const context = useContext<StepperContextValue<K> | undefined>(
      StepperContext
   )
   if (!context) {
      throw new Error("useStepper must be used within a StepperProvider")
   }
   return context
}

const SteppedDialog = <K extends string>({
   handleClose,
   open,
   views,
}: StepperDialogProps) => {
   const theme = useTheme()
   const isMobile = useIsMobile()

   const steps = views.length
   const [currentStep, setCurrentStep] = useState(0)

   const moveToNext = useCallback(() => {
      if (currentStep < steps - 1) {
         setCurrentStep(currentStep + 1)
      }
   }, [currentStep, steps])

   const moveToPrev = useCallback(() => {
      if (currentStep > 0) {
         setCurrentStep(currentStep - 1)
      }
   }, [currentStep])

   // Map step keys to their indices
   const stepIndices = useMemo(() => {
      return views.reduce(
         (acc, step, index) => ({ ...acc, [step.key]: index }),
         {} as Record<K, number>
      )
   }, [views])

   const goToStep = useCallback(
      (key: K) => {
         const stepIndex = stepIndices[key]
         if (stepIndex !== undefined) {
            setCurrentStep(stepIndex)
         }
      },
      [stepIndices]
   )

   const value = useMemo<StepperContextValue<K>>(
      () => ({
         currentStep,
         moveToNext,
         moveToPrev,
         goToStep,
      }),
      [currentStep, goToStep, moveToNext, moveToPrev]
   )

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         TransitionComponent={
            isMobile ? SlideLeftTransition : SlideUpTransition
         }
         maxWidth="md"
         fullWidth
         fullScreen={isMobile}
         closeAfterTransition={true}
         PaperProps={{
            sx: styles.dialogPaper,
         }}
      >
         <DialogContent>
            <StepperContext.Provider value={value}>
               <SwipeableViews
                  style={styles.swipeableViews}
                  containerStyle={styles.swipeableViewsContainer}
                  slideStyle={styles.slide}
                  disabled
                  axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                  index={currentStep}
               >
                  {views.map(({ Component, key }) => (
                     <Component key={key} />
                  ))}
               </SwipeableViews>
            </StepperContext.Provider>
         </DialogContent>
      </Dialog>
   )
}

export default SteppedDialog
