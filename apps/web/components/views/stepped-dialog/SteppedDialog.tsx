import { Dialog, useTheme } from "@mui/material"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import SwipeableViews from "react-swipeable-views"

import useIsMobile from "components/custom-hook/useIsMobile"
import { AnimatedTabPanel } from "materialUI/GlobalPanels/GlobalPanels"
import {
   ComponentType,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { sxStyles } from "types/commonTypes"
import { SlideLeftTransition, SlideUpTransition } from "../common/transitions"

const styles = sxStyles({
   slide: {
      overflow: "overlay",
      display: "flex",
      flexDirection: "column",
   },
   dialogPaper: {
      ...NICE_SCROLLBAR_STYLES,
      borderRadius: {
         md: 5,
      },
      display: "flex",
      flexDirection: "column",
      maxHeight: "none",
      maxWidth: 770,
   },
   content: {
      p: 0,
   },
})

/**
 * The View interface is used to type the `views` prop in the SteppedDialog component.
 * It has a unique key and a Component.
 *
 * @interface
 * @property {string} key - A unique identifier for the View
 * @property {ComponentType} Component - A React component that will be rendered for the View
 */
interface View {
   key: string
   Component: ComponentType
}

/**
 * The StepperDialogProps interface is used to type the props of the SteppedDialog component.
 *
 * @interface
 * @property {Function} handleClose - A function that closes the dialog
 * @property {boolean} open - A boolean that controls whether the dialog is open or closed
 * @property {Array<View>} views - An array of views that the dialog will display
 */
interface StepperDialogProps {
   handleClose: () => void
   open: boolean
   views: ReadonlyArray<View>
   bgcolor?: string
}

/**
 * The StepperContextValue interface is used to type the context provided by the StepperContext Provider.
 *
 * @interface
 * @property {number} currentStep - The current step in the SteppedDialog
 * @property {Function} moveToNext - A function that moves to the next step in the SteppedDialog
 * @property {Function} moveToPrev - A function that moves to the previous step in the SteppedDialog
 * @property {Function} goToStep - A function that goes to a specific step in the SteppedDialog
 */
interface StepperContextValue<K extends string = string> {
   currentStep: number
   moveToNext: () => void
   moveToPrev: () => void
   goToStep: (key: K) => void
}

const StepperContext = createContext<StepperContextValue>({
   currentStep: 0,
   moveToNext: () => {},
   moveToPrev: () => {},
   goToStep: () => {},
})

/**
 * useStepper is a hook that provides access to the StepperContext. It should be used within a component that is a child of the StepperContext Provider.
 *
 * @throws Will throw an error if used outside of the StepperContext Provider
 * @return {StepperContextValue} - The current stepper context
 */
export const useStepper = <K extends string>() => {
   const context = useContext<StepperContextValue<K> | undefined>(
      StepperContext
   )
   if (!context) {
      throw new Error("useStepper must be used within a StepperProvider")
   }
   return context
}

/**
 * SteppedDialog is a dialog component that displays a series of views. It uses the StepperContext to keep track of which view is currently being shown. The dialog can be navigated using the provided context methods: `moveToNext`, `moveToPrev`, and `goToStep`.
 *
 * @component
 * @example
 * ```jsx
 * const views = [
 *   { key: 'step1', Component: Step1 },
 *   { key: 'step2', Component: Step2 }
 * ] as const;
 *
 * return <SteppedDialog open={isOpen} handleClose={closeDialog} views={views} />
 * ```
 * @param {StepperDialogProps} props - The properties that define the SteppedDialog component
 * @param {Function} props.handleClose - The function that will be called when the dialog needs to be closed
 * @param {boolean} props.open - The state that controls whether the dialog is open or closed
 * @param {Array<View>} props.views - The array of views that the dialog will display
 */
const SteppedDialog = <K extends string>({
   handleClose,
   open,
   views,
   bgcolor,
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
            sx: [
               styles.dialogPaper,
               {
                  bgcolor,
               },
            ],
         }}
      >
         <StepperContext.Provider value={value}>
            <SwipeableViews
               slideStyle={styles.slide}
               disabled
               axis={theme.direction === "rtl" ? "x-reverse" : "x"}
               index={currentStep}
            >
               {views.map(({ Component, key }, index) => (
                  <AnimatedTabPanel
                     key={key}
                     value={index}
                     activeValue={currentStep}
                  >
                     <Component />
                  </AnimatedTabPanel>
               ))}
            </SwipeableViews>
         </StepperContext.Provider>
      </Dialog>
   )
}

export default SteppedDialog
