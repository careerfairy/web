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
   sparksDialogOpenSelector,
} from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import { SparkFormValues } from "./views/hooks/useSparkFormSubmit"

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
      (creatorId: string) => {
         dispatch(setCreatorAction(creatorId))
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
      (creatorId: string) => {
         setCreator(creatorId)
         stepper.goToStep("creator-selected")
      },
      [setCreator, stepper]
   )

   const goToCreateOrEditCreatorView = useCallback(
      (creatorId: string) => {
         stepper.goToStep("create-or-edit-creator")
         setCreator(creatorId)
      },
      [setCreator, stepper]
   )

   const goToSelectCreatorView = useCallback(() => {
      stepper.goToStep("select-creator")
      setCreator(null)
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

   return (
      <>
         <SteppedDialog
            key={open ? "open" : "closed"}
            bgcolor="#FCFCFC"
            handleClose={() => hanldeCloseSparksDialog()}
            open={open}
            views={views}
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
   onMobileBack?: () => void
   width?: string | number
   hideCloseButton?: boolean
}

const Container: FC<SparksDialogContainerProps> = ({
   width,
   sx,
   hideCloseButton,
   ...props
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
            {props.children}
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

const Actions: FC<BoxProps> = ({ children, sx, ...props }) => {
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

SparksDialog.Title = Title
SparksDialog.Subtitle = Subtitle
SparksDialog.Container = Container
SparksDialog.Actions = Actions
SparksDialog.Button = CustomButton
SparksDialog.ActionsOffset = ActionsOffset
SparksDialog.Content = Content

export default SparksDialog
