import CloseIcon from "@mui/icons-material/CloseRounded"
import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import {
   Box,
   BoxProps,
   CircularProgress,
   IconButton,
   Container as MuiContainer,
   Stack,
   Typography,
   TypographyProps,
   StackProps,
} from "@mui/material"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import dynamic from "next/dynamic"
import { FC, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { combineStyles, sxStyles } from "types/commonTypes"
import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import { closeGroupPlansDialog } from "store/reducers/groupPlanReducer"
import {
   groupPlansDialogInitialStepSelector,
   plansDialogOpenSelector,
} from "store/selectors/groupSelectors"

const actionsHeight = 87
const mobileTopPadding = 20
const mobileBreakpoint = "md"

const styles = sxStyles({
   root: {},
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
      position: "relative",
      height: {
         xs: "100dvh",
         [mobileBreakpoint]: "clamp(0px, calc(100dvh - 50px), 855px)",
      },
      justifyContent: {
         xs: "flex-start",
         [mobileBreakpoint]: "center",
      },
      display: "flex",
      placeItems: {
         [mobileBreakpoint]: "center",
      },
   },
   container: {
      width: "100%",
      height: "100%",
      display: "grid",
      flexDirection: "column",
   },
   content: {
      display: "flex",
      flexDirection: "column",
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
   mobileBackBtn: {
      position: "absolute",
      top: `${mobileTopPadding * 1.25}px`,
      left: 0,
      zIndex: 1,
      p: 1,
      color: "text.primary",
      fontSize: "2rem",
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
   warningIcon: {
      fontSize: 62,
   },
})

const views = [
   {
      key: "select-plan",
      Component: dynamic(
         () => import("components/views/checkout/views/SelectGroupPlanView"),
         { loading: () => <CircularProgress /> }
      ),
   },
   {
      key: "select-or-change-plan",
      Component: dynamic(
         () => import("components/views/checkout/views/SelectGroupPlanView"),
         { loading: () => <CircularProgress /> }
      ),
   },
] as const

export type GroupPlansDialogStep = (typeof views)[number]["key"]

export const useSparksPlansForm = () => {
   const stepper = useStepper<GroupPlansDialogStep>()
   const dispatch = useDispatch()

   const setPlan = useCallback(
      (plan: GroupPlanType) => {
         dispatch(setPlan(plan))
      },
      [dispatch]
   )

   const handleClose = useCallback(() => {
      dispatch(closeGroupPlansDialog())
   }, [dispatch])

   const goToSelectPlanView = useCallback(() => {
      setStateAndNavigate(setPlan, stepper.goToStep, null, "select-plan")
   }, [setPlan, stepper])

   return useMemo(() => {
      return {
         stepper,
         handleClose,
         goToSelectPlanView,
      }
   }, [handleClose, goToSelectPlanView, stepper])
}

const GroupPlansDialog = () => {
   const initialStepKey = useSelector(groupPlansDialogInitialStepSelector)

   const open = useSelector(plansDialogOpenSelector)

   const dispatch = useDispatch()

   const handleCloseGroupPlansDialog = useCallback(
      (forceClose: boolean = false) => {
         dispatch(
            closeGroupPlansDialog({
               forceClose,
            })
         )
      },
      [dispatch]
   )

   const initialStep = useMemo(() => {
      if (initialStepKey) {
         const index = views.findIndex((view) => view.key === initialStepKey)
         if (index !== -1) {
            return index
         }
      }
      return 0
   }, [initialStepKey])

   return (
      <>
         <SteppedDialog
            key={open ? "open" : "closed"}
            bgcolor="#FCFCFC"
            handleClose={() => handleCloseGroupPlansDialog()}
            open={open}
            views={views}
            initialStep={initialStep}
         />
      </>
   )
}

const Title: FC<TypographyProps<"h1">> = (props) => {
   return <Typography component="h1" sx={styles.title} {...props} />
}

const Subtitle: FC<TypographyProps<"h2">> = (props) => {
   return (
      <Typography
         component="h2"
         maxWidth={385}
         sx={styles.subtitle}
         {...props}
      />
   )
}

type GroupPlansDialogContainerProps = BoxProps & {
   width?: string | number
   hideCloseButton?: boolean
}

const Container: FC<GroupPlansDialogContainerProps> = ({
   width,
   sx,
   hideCloseButton,
   children,
}) => {
   const { handleClose } = useSparksPlansForm()
   const open = useSelector(plansDialogOpenSelector)
   console.log("🚀 ~ open:", open, width)
   return (
      <Box sx={combineStyles(styles.containerWrapper, sx)}>
         <MuiContainer
            sx={[
               styles.container,
               // width
               //    ? {
               //         width: {
               //            [mobileBreakpoint]: width,
               //         },
               //      }
               //    : null,
            ]}
            disableGutters
            maxWidth={"lg"}
         >
            {children}
            {hideCloseButton ? null : (
               <Box sx={styles.closeBtn}>
                  <IconButton onClick={handleClose}>
                     <CloseIcon />
                  </IconButton>
               </Box>
            )}
         </MuiContainer>
      </Box>
   )
}

// eslint-disable-next-line @typescript-eslint/ban-types
type ContentProps = BoxProps<"span"> & {}

const Content: FC<ContentProps> = ({ sx, ...props }) => {
   return <Box sx={combineStyles(sx, styles.content)} {...props} />
}

const Actions: FC<StackProps> = ({ children, sx, ...props }) => {
   const {
      stepper: { currentStep },
   } = useSparksPlansForm()

   console.log("🚀 ~ currentStep:", currentStep)
   return (
      <Stack
         justifyContent={"center"}
         alignContent={"center"}
         direction="row"
         // left={`${currentStep * 100}%`}
         alignItems="center"
         spacing={2}
         zIndex={1}
         sx={combineStyles(sx, styles.fixedBottomContent)}
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
            sx={combineStyles(sx, styles.button)}
            color="secondary"
            {...props}
         >
            {children}
         </LoadingButton>
      </span>
   )
}

/**
 * Utility function to set state and navigate to a step.
 * This function is designed to avoid the 'maximum update depth' error in React.
 * It does this by using setTimeout to enqueue the state update operation in the JavaScript event loop,
 * which ensures that the state update and navigation don't occur in the same rendering phase.
 *
 * @param {Function} setState - The function to update the state.
 * @param {Function} goToStep - The function to navigate to a step.
 * @param {any} stateValue - The new state value.
 * @param {string} step - The step to navigate to.
 */
function setStateAndNavigate(
   // eslint-disable-next-line @typescript-eslint/ban-types
   setState: Function,
   // eslint-disable-next-line @typescript-eslint/ban-types
   goToStep: Function,
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   stateValue: any,
   step: GroupPlansDialogStep
) {
   setState(stateValue)
   setTimeout(() => {
      goToStep(step)
   }, 0)
}

GroupPlansDialog.Title = Title
GroupPlansDialog.Subtitle = Subtitle
GroupPlansDialog.Container = Container
GroupPlansDialog.Actions = Actions
GroupPlansDialog.Button = CustomButton
GroupPlansDialog.ActionsOffset = ActionsOffset
GroupPlansDialog.Content = Content

export default GroupPlansDialog
