import CloseIcon from "@mui/icons-material/CloseRounded"
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded"
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
import ConfirmationDialog, {
   ConfirmationDialogAction,
} from "materialUI/GlobalModals/ConfirmationDialog"
import dynamic from "next/dynamic"
import { FC, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   closeConfirmCloseSparksDialog,
   closeSparkDialog,
   setCachedSparksFormValues,
   setCreator as setCreatorAction,
   setSpark as setSparkAction,
} from "store/reducers/adminSparksReducer"
import {
   sparksConfirmCloseSparksDialogOpen,
   sparksDialogInitialStepSelector,
   sparksDialogOpenSelector,
} from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import { SparkFormValues } from "./views/hooks/useSparkFormSubmit"
import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"

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
         [mobileBreakpoint]: "clamp(0px, calc(100dvh - 50px), 778px)",
      },
      justifyContent: {
         xs: "flex-start",
         [mobileBreakpoint]: "center",
      },
      display: {
         [mobileBreakpoint]: "grid",
      },
      placeItems: {
         [mobileBreakpoint]: "center",
      },
   },
   container: {
      width: {
         xs: "100%",
         [mobileBreakpoint]: 535,
      },
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
      key: "select-creator",
      Component: dynamic(
         () =>
            import(
               "components/views/admin/sparks/sparks-dialog/views/SelectCreatorView"
            ),
         { loading: () => <CircularProgress /> }
      ),
   },
   {
      key: "creator-selected",
      Component: dynamic(
         () =>
            import(
               "components/views/admin/sparks/sparks-dialog/views/CreatorSelectedView"
            ),
         { loading: () => <CircularProgress /> }
      ),
   },
   {
      key: "create-or-edit-creator",
      Component: dynamic(
         () =>
            import(
               "components/views/admin/sparks/sparks-dialog/views/CreateOrEditCreatorView"
            ),
         { loading: () => <CircularProgress /> }
      ),
   },
   {
      key: "create-or-edit-spark",
      Component: dynamic(
         () =>
            import(
               "components/views/admin/sparks/sparks-dialog/views/CreateOrEditSparkView"
            ),
         { loading: () => <CircularProgress /> }
      ),
   },
] as const

export type SparkDialogStep = (typeof views)[number]["key"]

export const useSparksForm = () => {
   const stepper = useStepper<SparkDialogStep>()
   const dispatch = useDispatch()

   const setCreator = useCallback(
      (creator: PublicCreator) => {
         dispatch(setCreatorAction(creator))
      },
      [dispatch]
   )

   const setSpark = useCallback(
      (sparkId: string) => {
         dispatch(setSparkAction(sparkId))
      },
      [dispatch]
   )

   const handleClose = useCallback(() => {
      dispatch(closeSparkDialog())
   }, [dispatch])

   const goToCreatorSelectedView = useCallback(
      (creator: PublicCreator) => {
         setStateAndNavigate(
            setCreator,
            stepper.goToStep,
            creator,
            "creator-selected"
         )
      },
      [setCreator, stepper]
   )

   const goToCreateOrEditCreatorView = useCallback(
      (creator: PublicCreator) => {
         setStateAndNavigate(
            setCreator,
            stepper.goToStep,
            creator,
            "create-or-edit-creator"
         )
      },
      [setCreator, stepper]
   )

   const goToSelectCreatorView = useCallback(() => {
      setStateAndNavigate(setCreator, stepper.goToStep, null, "select-creator")
   }, [setCreator, stepper])

   const goToCreateSparkView = useCallback(() => {
      stepper.goToStep("create-or-edit-spark")
   }, [stepper])

   const handleCacheSparksFormValues = useCallback(
      (value: SparkFormValues | null) => {
         dispatch(setCachedSparksFormValues(value))
      },
      [dispatch]
   )

   return useMemo(() => {
      return {
         setCreator,
         setSpark,
         stepper,
         handleClose,
         goToCreatorSelectedView,
         goToCreateOrEditCreatorView,
         goToSelectCreatorView,
         goToCreateSparkView,
         handleCacheSparksFormValues,
      }
   }, [
      goToCreateOrEditCreatorView,
      goToCreateSparkView,
      goToCreatorSelectedView,
      goToSelectCreatorView,
      handleCacheSparksFormValues,
      handleClose,
      setCreator,
      setSpark,
      stepper,
   ])
}

const SparksDialog = () => {
   const initialStepKey = useSelector(sparksDialogInitialStepSelector)

   const open = useSelector(sparksDialogOpenSelector)
   const confirmCloseDialogOpen = useSelector(
      sparksConfirmCloseSparksDialogOpen
   )

   const dispatch = useDispatch()

   const hanldeCloseSparksDialog = useCallback(
      (forceClose: boolean = false) => {
         dispatch(
            closeSparkDialog({
               forceClose,
            })
         )
      },
      [dispatch]
   )

   const handleCloseConfirmCloseDialog = useCallback(() => {
      dispatch(closeConfirmCloseSparksDialog())
   }, [dispatch])

   const primaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         text: "No, stay here",
         callback: handleCloseConfirmCloseDialog,
         color: "grey",
         variant: "outlined",
      }),
      [handleCloseConfirmCloseDialog]
   )

   const secondaryAction = useMemo<ConfirmationDialogAction>(
      () => ({
         text: "Yes, close",
         callback: () => hanldeCloseSparksDialog(true),
         color: "error",
         variant: "contained",
      }),
      [hanldeCloseSparksDialog]
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
            handleClose={() => hanldeCloseSparksDialog()}
            open={open}
            views={views}
            initialStep={initialStep}
         />
         {confirmCloseDialogOpen ? (
            <ConfirmationDialog
               open={confirmCloseDialogOpen}
               handleClose={handleCloseConfirmCloseDialog}
               description="If you close this window now the info that you inserted will be lost. Are you sure you want to proceed?"
               title="Close window?"
               icon={
                  <ErrorOutlineRoundedIcon
                     sx={styles.warningIcon}
                     color="error"
                  />
               }
               primaryAction={primaryAction}
               secondaryAction={secondaryAction}
            />
         ) : null}
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

type SparksDialogContainerProps = BoxProps & {
   width?: string | number
   hideCloseButton?: boolean
}

const Container: FC<SparksDialogContainerProps> = ({
   width,
   sx,
   hideCloseButton,
   children,
}) => {
   const { handleClose } = useSparksForm()

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
            ]}
            maxWidth="md"
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
   const {
      stepper: { currentStep },
   } = useSparksForm()
   return (
      <Stack
         justifyContent={"flex-end"}
         direction="row"
         left={`${currentStep * 100}%`}
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
   setState: Function,
   goToStep: Function,
   stateValue: any,
   step: SparkDialogStep
) {
   setState(stateValue)
   setTimeout(() => {
      goToStep(step)
   }, 0)
}

SparksDialog.Title = Title
SparksDialog.Subtitle = Subtitle
SparksDialog.Container = Container
SparksDialog.Actions = Actions
SparksDialog.Button = CustomButton
SparksDialog.ActionsOffset = ActionsOffset
SparksDialog.Content = Content

export default SparksDialog
