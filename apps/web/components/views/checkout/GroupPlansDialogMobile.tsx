import CloseIcon from "@mui/icons-material/CloseRounded"
import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import {
   Box,
   BoxProps,
   CircularProgress,
   IconButton,
   Typography,
   TypographyProps,
} from "@mui/material"
import { useStepper } from "components/views/stepped-dialog/SteppedDialog"
import dynamic from "next/dynamic"
import { FC, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { combineStyles, sxStyles } from "types/commonTypes"
import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import {
   closeGroupPlansDialog,
   setPlan as setPlanAction,
   setSecret as setClientSecretAction,
} from "store/reducers/groupPlanReducer"
import { plansDialogOpenSelector } from "store/selectors/groupSelectors"
import BrandedSwipableDrawer from "../common/inputs/BrandedSwipableDrawer"
import SelectGroupPlanView from "components/views/checkout/views/SelectGroupPlanView"

const actionsHeight = 87
const mobileTopPadding = 20
const mobileBreakpoint = "md"

const styles = sxStyles({
   root: {},
   dialogPaperMobile: { minWidth: "100%", minHeight: "100%" },
   steppedDialog: {
      minWidth: {
         xs: "100%",
         md: "auto",
      },
      minHeight: {
         xs: "100%",
         md: "auto",
      },
   },
   title: {
      color: (theme) => theme.palette.neutral[800],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "32px",
      fontStyle: "normal",
      fontWeight: "700",
      lineHeight: "48px",
      letterSpacing: {
         xs: "-0.04343rem",
         [mobileBreakpoint]: "-0.04886rem",
      },
   },
   subtitle: {
      letterSpacing: "-0.02171rem",
      mx: {
         [mobileBreakpoint]: "auto",
      },
      color: (theme) => theme.palette.neutral[800],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   containerWrapper: {
      flexDirection: "column",
      py: `${mobileTopPadding}px`,
      position: "relative",
      height: "100%",
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
      display: "flex",
      flexDirection: "column",
   },
   content: {
      display: "flex",
      flexDirection: "column",
      px: 4,
      py: 3,
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
   // {
   //    key: "select-plan-mobile",
   //    Component: dynamic(
   //       () => import("components/views/checkout/views/SelectGroupPlanMobileView"),
   //       { loading: () => <CircularProgress /> }
   //    ),
   // },
   {
      key: "checkout",
      Component: dynamic(
         () => import("components/views/checkout/views/GroupPlanCheckoutView"),
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
         dispatch(setPlanAction(plan))
      },
      [dispatch]
   )

   const setClientSecret = useCallback(
      (secret: string) => {
         dispatch(setClientSecretAction(secret))
      },
      [dispatch]
   )

   const handleClose = useCallback(() => {
      dispatch(closeGroupPlansDialog())
   }, [dispatch])

   const goToSelectedPlanCheckoutView = useCallback(
      (plan: GroupPlanType) => {
         setStateAndNavigate(setPlan, stepper.goToStep, plan, "checkout")
      },
      [setPlan, stepper]
   )

   return useMemo(() => {
      return {
         stepper,
         handleClose,
         goToCheckoutView: goToSelectedPlanCheckoutView,
         setPlan: setPlan,
         setClientSecret: setClientSecret,
      }
   }, [
      handleClose,
      goToSelectedPlanCheckoutView,
      stepper,
      setPlan,
      setClientSecret,
   ])
}

const GroupPlansDialogMobile = () => {
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

   return (
      <>
         <BrandedSwipableDrawer
            open={open}
            onOpen={() => {}}
            onClose={() => handleCloseGroupPlansDialog()}
         >
            <h1>Test</h1>
            <SelectGroupPlanView />
         </BrandedSwipableDrawer>
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
   sx,
   hideCloseButton,
   children,
}) => {
   const { handleClose } = useSparksPlansForm()

   const open = useSelector(plansDialogOpenSelector)

   return (
      <Box sx={combineStyles(styles.containerWrapper, sx)}>
         <BrandedSwipableDrawer
            open={open}
            onOpen={() => {}}
            onClose={() => handleClose()}
         >
            {children}
            {hideCloseButton ? null : (
               <Box sx={styles.closeBtn}>
                  <IconButton onClick={handleClose}>
                     <CloseIcon />
                  </IconButton>
               </Box>
            )}
         </BrandedSwipableDrawer>
      </Box>
   )
}

// eslint-disable-next-line @typescript-eslint/ban-types
type ContentProps = BoxProps<"span"> & {}

const Content: FC<ContentProps> = ({ sx, ...props }) => {
   return <Box sx={combineStyles(sx, styles.content)} {...props} />
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

GroupPlansDialogMobile.Title = Title
GroupPlansDialogMobile.Subtitle = Subtitle
GroupPlansDialogMobile.Container = Container
GroupPlansDialogMobile.Button = CustomButton
GroupPlansDialogMobile.ActionsOffset = ActionsOffset
GroupPlansDialogMobile.Content = Content

export default GroupPlansDialogMobile
