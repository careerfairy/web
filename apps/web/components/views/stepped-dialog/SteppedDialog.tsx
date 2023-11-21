import {
   Box,
   BoxProps,
   Container as MuiContainer,
   Dialog,
   IconButton,
   Stack,
   StackProps,
   Theme,
   Typography,
   TypographyProps,
   useTheme,
} from "@mui/material"
import { NICE_SCROLLBAR_STYLES } from "constants/layout"
import SwipeableViews from "react-swipeable-views"

import useIsMobile from "components/custom-hook/useIsMobile"
import { AnimatedTabPanel } from "materialUI/GlobalPanels/GlobalPanels"
import {
   ComponentType,
   createContext,
   FC,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { sxStyles } from "types/commonTypes"
import { SlideLeftTransition, SlideUpTransition } from "../common/transitions"
import CloseIcon from "@mui/icons-material/CloseRounded"
import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { SxProps } from "@mui/material/styles"

const actionsHeight = 87
const mobileTopPadding = 20
const mobileBreakpoint = "md"

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
      overflowY: "auto",
      top: { xs: "70px", md: 0 },
   },
   content: {
      p: 0,
   },
   title: {
      letterSpacing: {
         xs: "-0.04343rem",
         [mobileBreakpoint]: "-0.04886rem",
      },
      fontSize: {
         xs: "2.28571rem", // 32px
         [mobileBreakpoint]: "2.57143rem", // 36px
      },
      fontWeight: 600,
      lineHeight: "150%",
      textAlign: {
         [mobileBreakpoint]: "center",
      },
   },
   subtitle: {
      color: "text.secondary",
      fontSize: "1.14286rem",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "150%",
      letterSpacing: "-0.02171rem",
      mx: {
         [mobileBreakpoint]: "auto",
      },
      textAlign: {
         mobile: "center",
      },
   },
   containerWrapper: {
      flexDirection: "column",
      py: `${mobileTopPadding}px`,
      px: { xs: 3, md: 6 },
      position: "relative",
      height: {
         xs: "90dvh",
         [mobileBreakpoint]: "clamp(0px, calc(100dvh - 50px), 778px)",
      },
   },
   container: {
      px: "unset !important",
   },
   closeBtn: {
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 1,
      pt: {
         xs: 2.5,
         [mobileBreakpoint]: 2.125,
      },
      pr: {
         xs: 2,
         [mobileBreakpoint]: 2.5,
      },
      color: "text.primary",
      "& svg": {
         width: 32,
         height: 32,
         color: "text.primary",
      },
   },
   fixedBottomContent: {
      position: "fixed",
      bottom: 0,
      width: "100%",
      p: 2.5,
      borderTop: "1px solid #F0F0F0",
      height: actionsHeight,
      bgcolor: "#FCFCFC",
   },
   button: {
      textTransform: "none",
      "&:disabled": {
         bgcolor: "#EDEDED",
         color: "#BBBBBB",
      },
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
   initialStep?: number
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
   handleClose: () => void
}

const StepperContext = createContext<StepperContextValue>({
   currentStep: 0,
   moveToNext: () => {},
   moveToPrev: () => {},
   goToStep: () => {},
   handleClose: () => {},
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
   initialStep = 0,
}: StepperDialogProps) => {
   const theme = useTheme()
   const isMobile = useIsMobile()

   const steps = views.length
   const [currentStep, setCurrentStep] = useState(initialStep)

   useEffect(() => {
      if (open) {
         setCurrentStep(initialStep) // reset currentStep to initialStep when dialog is opened
      }
   }, [open, initialStep])

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
         handleClose,
      }),
      [currentStep, goToStep, handleClose, moveToNext, moveToPrev]
   )

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         TransitionComponent={
            isMobile
               ? steps === 1
                  ? SlideUpTransition
                  : SlideLeftTransition
               : SlideUpTransition
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

const Title: FC<TypographyProps<"h1">> = ({ sx, ...props }) => {
   return (
      <Typography
         component="h1"
         sx={[styles.title, ...(Array.isArray(sx) ? sx : [sx])]}
         {...props}
      />
   )
}

const Subtitle: FC<TypographyProps<"h2">> = (props) => {
   return (
      <Typography
         color={"#1F1F29"}
         component="h2"
         maxWidth={385}
         sx={styles.subtitle}
         {...props}
      />
   )
}

type SteppedDialogContainerProps = BoxProps & {
   width?: string | number
   hideCloseButton?: boolean
   containerSx?: SxProps<Theme>
}

const Container: FC<SteppedDialogContainerProps> = ({
   width,
   sx,
   hideCloseButton,
   children,
   containerSx,
}) => {
   const stepper = useStepper()

   return (
      <Box sx={[styles.containerWrapper, ...(Array.isArray(sx) ? sx : [sx])]}>
         <MuiContainer
            sx={[
               styles.container,
               width
                  ? {
                       width: {
                          [mobileBreakpoint]: width,
                       },
                    }
                  : null,
               ...(Array.isArray(containerSx) ? containerSx : [containerSx]),
            ]}
            maxWidth="md"
         >
            {children}
            {hideCloseButton ? null : (
               <Box sx={styles.closeBtn}>
                  <IconButton onClick={stepper.handleClose}>
                     <CloseIcon />
                  </IconButton>
               </Box>
            )}
         </MuiContainer>
      </Box>
   )
}

type ContentProps = BoxProps<"span"> & {}

const Content: FC<ContentProps> = ({ sx, ...props }) => {
   return (
      <Box
         component="span"
         sx={[...(Array.isArray(sx) ? sx : [sx]), styles.content]}
         {...props}
      />
   )
}

const Actions: FC<StackProps> = ({ children, sx, ...props }) => {
   const stepper = useStepper()

   return (
      <Stack
         justifyContent={"flex-end"}
         direction="row"
         left={`${stepper.currentStep * 100}%`}
         alignItems="center"
         spacing={2}
         zIndex={1}
         sx={[...(Array.isArray(sx) ? sx : [sx]), styles.fixedBottomContent]}
         {...props}
      >
         {children}
      </Stack>
   )
}

const ActionsOffset: FC<BoxProps> = ({ height = actionsHeight }) => {
   return <Box height={height} />
}

const CustomButton: FC<LoadingButtonProps> = ({ children, sx, ...props }) => {
   return (
      <span>
         <LoadingButton
            sx={[...(Array.isArray(sx) ? sx : [sx]), styles.button]}
            color="secondary"
            {...props}
         >
            {children}
         </LoadingButton>
      </span>
   )
}

SteppedDialog.Title = Title
SteppedDialog.Subtitle = Subtitle
SteppedDialog.Container = Container
SteppedDialog.Actions = Actions
SteppedDialog.Button = CustomButton
SteppedDialog.ActionsOffset = ActionsOffset
SteppedDialog.Content = Content

export default SteppedDialog
