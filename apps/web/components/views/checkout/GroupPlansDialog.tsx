import CloseIcon from "@mui/icons-material/CloseRounded"
import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import {
   Box,
   BoxProps,
   IconButton,
   Typography,
   TypographyProps,
   Dialog,
} from "@mui/material"
import { FC, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { combineStyles, sxStyles } from "types/commonTypes"
import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import {
   closeGroupPlansDialog,
   setPlan as setPlanAction,
   setSecret as setClientSecretAction,
} from "store/reducers/groupPlanReducer"
import {
   clientSecret,
   plansDialogOpenSelector,
} from "store/selectors/groupSelectors"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import React from "react"
import { SlideUpTransition } from "../common/transitions"
import GroupPlanCheckoutView from "components/views/checkout/views/GroupPlanCheckoutView"
import SelectGroupPlanView from "components/views/checkout/views/SelectGroupPlanView"
import GroupPlansMobileView from "./views/GroupPlansMobileView"

const actionsHeight = 87
const mobileTopPadding = 20
const mobileBreakpoint = "md"

const styles = sxStyles({
   dialogPaperMobile: { minWidth: "100%", minHeight: "100%" },
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
   button: {
      textTransform: "none",
      "&:disabled": {
         bgcolor: "#EDEDED",
         color: "#BBBBBB",
      },
   },
   closeBtn: {
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 2,
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
})

export const useSparksPlansForm = () => {
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
         setState(setPlan, plan)
      },
      [setPlan]
   )

   return useMemo(() => {
      return {
         handleClose,
         goToCheckoutView: goToSelectedPlanCheckoutView,
         setPlan: setPlan,
         setClientSecret: setClientSecret,
      }
   }, [handleClose, goToSelectedPlanCheckoutView, setPlan, setClientSecret])
}

const GroupPlansDialog = () => {
   const generatedClientSecret = useSelector(clientSecret)
   const isMobile = useIsMobile()

   return (
      <>
         <ConditionalWrapper
            condition={!isMobile}
            fallback={<GroupPlansMobileView />}
         >
            <ConditionalWrapper
               condition={Boolean(generatedClientSecret)}
               fallback={<SelectGroupPlanView />}
            >
               <GroupPlanCheckoutView />
            </ConditionalWrapper>
         </ConditionalWrapper>
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
   const isMobile = useIsMobile()
   const open = useSelector(plansDialogOpenSelector)

   return (
      <Box sx={combineStyles(styles.containerWrapper, sx)}>
         <Dialog
            sx={styles.container}
            scroll="paper"
            open={open}
            maxWidth={false}
            PaperProps={isMobile ? { sx: styles.dialogPaperMobile } : {}}
            TransitionComponent={SlideUpTransition}
         >
            {children}
            {hideCloseButton ? null : (
               <Box sx={styles.closeBtn}>
                  <IconButton onClick={handleClose}>
                     <CloseIcon />
                  </IconButton>
               </Box>
            )}
         </Dialog>
      </Box>
   )
}

type ContentProps = BoxProps<"span">

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
function setState(
   // eslint-disable-next-line @typescript-eslint/ban-types
   setState: Function,
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   stateValue: any
) {
   setState(stateValue)
}

GroupPlansDialog.Title = Title
GroupPlansDialog.Subtitle = Subtitle
GroupPlansDialog.Container = Container
GroupPlansDialog.Button = CustomButton
GroupPlansDialog.ActionsOffset = ActionsOffset
GroupPlansDialog.Content = Content

export default GroupPlansDialog
