import BackIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import CloseIcon from "@mui/icons-material/CloseRounded"
import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import {
   Box,
   BoxProps,
   CircularProgress,
   ContainerProps,
   IconButton,
   Container as MuiContainer,
   Stack,
   Typography,
   TypographyProps,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import SteppedDialog, {
   useStepper,
} from "components/views/stepped-dialog/SteppedDialog"
import dynamic from "next/dynamic"
import { FC, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   setCachedSparksFormValues,
   closeSparkDialog,
   setCreator as setCreatorAction,
   setSpark as setSparkAction,
   openConfirmCloseSparksDialog,
   closeConfirmCloseSparksDialog,
} from "store/reducers/adminSparksReducer"
import {
   sparksConfirmCloseSparksDialogOpen,
   sparksDialogOpenSelector,
} from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import { SparkFormValues } from "./views/hooks/useSparkFormSubmit"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded"

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
         xs: "100vh",
         [mobileBreakpoint]: "clamp(0px, calc(100vh - 50px), 778px)",
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
   mobileCloseBtn: {
      position: "absolute",
      top: `${mobileTopPadding * 1.25}px`,
      right: 0,
      zIndex: 1,
      p: 1,
      color: "text.primary",
      fontSize: "2rem",
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
      if (stepper.currentStep === "") {
      }
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

   const handleClose = useCallback(() => {
      dispatch(closeSparkDialog())
   }, [dispatch])

   const handleOpenConfirmCloseDialog = useCallback(() => {
      dispatch(openConfirmCloseSparksDialog())
   }, [dispatch])

   const handleCloseConfirmCloseDialog = useCallback(() => {
      dispatch(closeConfirmCloseSparksDialog())
   }, [dispatch])

   const handleCloseClick = useCallback(() => {
      handleOpenConfirmCloseDialog()
   }, [handleOpenConfirmCloseDialog])

   return (
      <>
         <SteppedDialog
            key={open ? "open" : "closed"}
            bgcolor="#FCFCFC"
            handleClose={handleCloseClick}
            open={open}
            views={views}
         />{" "}
         {confirmCloseDialogOpen ? (
            <ConfirmationDialog
               open={confirmCloseDialogOpen}
               handleClose={handleClose}
               description="If you close this window now the info that you inserted will be lost. Are you sure you want to proceed?"
               title="Close window?"
               icon={
                  <ErrorOutlineRoundedIcon
                     sx={{ fontSize: 40 }}
                     color="error"
                  />
               }
               primaryAction={{
                  text: "No, stay here",
                  callback: handleCloseConfirmCloseDialog,
                  color: "grey",
                  variant: "outlined",
               }}
               secondaryAction={{
                  text: "Yes, close",
                  callback: handleClose,
                  color: "error",
                  variant: "contained",
               }}
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
   showMobileCloseButton?: boolean
   width?: number
}

const Container: FC<SparksDialogContainerProps> = ({
   onMobileBack,
   showMobileCloseButton,
   width,
   sx,
   ...props
}) => {
   const isMobile = useIsMobile()
   const dispatch = useDispatch()

   const handleCloseClick = useCallback(() => {
      dispatch(closeSparkDialog())
   }, [dispatch])

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
            maxWidth="sm"
         >
            {onMobileBack && isMobile ? (
               <IconButton sx={styles.mobileBackBtn} onClick={onMobileBack}>
                  <BackIcon />
               </IconButton>
            ) : null}
            {props.children}
            {showMobileCloseButton && isMobile ? (
               <IconButton
                  sx={styles.mobileCloseBtn}
                  onClick={handleCloseClick}
               >
                  <CloseIcon />
               </IconButton>
            ) : null}
         </MuiContainer>
      </Box>
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

export default SparksDialog
