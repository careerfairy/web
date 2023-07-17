import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import {
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
   CreatorOrNew,
   SparkOrNew,
   closeSparkDialog,
   setCreator as setCreatorAction,
   setSpark as setSparkAction,
} from "store/reducers/adminSparksReducer"
import { sparksDialogOpenSelector } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import BackIcon from "@mui/icons-material/ArrowBackIosNewRounded"
import CloseIcon from "@mui/icons-material/CloseRounded"

const actionsHeight = 87
const mobileTopPadding = 30

const styles = sxStyles({
   root: {},
   title: {
      letterSpacing: {
         xs: "-0.04343rem",
         mobile: "-0.04886rem",
      },
      fontSize: {
         xs: "2.28571rem", // 32px
         mobile: "2.57143rem", // 36px
      },
      fontWeight: 600,
      lineHeight: "150%",
      textAlign: {
         mobile: "center",
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
         mobile: "auto",
      },
      textAlign: {
         mobile: "center",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      py: `${mobileTopPadding}px`,
      position: "relative",
   },
   containerWithActionsOffset: {
      pb: `${actionsHeight * 1.2}px !important`,
   },
   fixedBottomContent: {
      position: "fixed",
      bottom: 0,
      left: "100%",
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
      top: `${mobileTopPadding * 1.15}px`,
      left: 0,
      zIndex: 1,
      p: 1,
      color: "text.primary",
      fontSize: "2rem",
   },
   mobileCloseBtn: {
      position: "absolute",
      top: `${mobileTopPadding * 1.15}px`,
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
      key: "create-creator",
      Component: dynamic(
         () =>
            import(
               "components/views/admin/sparks/sparks-dialog/views/CreateCreatorView"
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
         stepper.goToStep("create-creator")
         setCreator(creatorId)
      },
      [setCreator, stepper]
   )

   const goToSelectCreatorView = useCallback(() => {
      stepper.goToStep("select-creator")
      setCreator(null)
   }, [setCreator, stepper])

   return useMemo(() => {
      return {
         setCreator,
         setSpark,
         stepper,
         handleClose,
         goToCreatorSelectedView,
         goToCreateOrEditCreatorView,
         goToSelectCreatorView,
      }
   }, [
      goToCreateOrEditCreatorView,
      goToCreatorSelectedView,
      goToSelectCreatorView,
      handleClose,
      setCreator,
      setSpark,
      stepper,
   ])
}

const SparksDialog = () => {
   const open = useSelector(sparksDialogOpenSelector)

   const dispatch = useDispatch()

   const handleClose = useCallback(() => {
      dispatch(closeSparkDialog())
   }, [dispatch])

   return (
      <SteppedDialog
         key={open ? "open" : "closed"}
         bgcolor="#FCFCFC"
         handleClose={handleClose}
         open={open}
         views={views}
      />
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

type SparksDialogContainerProps = ContainerProps & {
   withActionsOffset?: boolean
   showMobileCloseButton?: boolean
   onMobileBack?: () => void
}

const Container: FC<SparksDialogContainerProps> = ({
   withActionsOffset,
   onMobileBack,
   showMobileCloseButton,
   sx,
   ...props
}) => {
   const isMobile = useIsMobile()
   const dispatch = useDispatch()

   const handleCloseClick = useCallback(() => {
      dispatch(closeSparkDialog())
   }, [dispatch])

   return (
      <MuiContainer
         maxWidth="sm"
         sx={[
            styles.container,
            withActionsOffset && styles.containerWithActionsOffset,
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         {...props}
      >
         {onMobileBack && isMobile ? (
            <IconButton sx={styles.mobileBackBtn} onClick={onMobileBack}>
               <BackIcon />
            </IconButton>
         ) : null}
         {props.children}
         {showMobileCloseButton && isMobile ? (
            <IconButton sx={styles.mobileCloseBtn} onClick={handleCloseClick}>
               <CloseIcon />
            </IconButton>
         ) : null}
      </MuiContainer>
   )
}

const Actions: FC<BoxProps> = ({ children, sx, ...props }) => {
   return (
      <Stack
         justifyContent={"flex-end"}
         direction="row"
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

export default SparksDialog
