import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import {
   BoxProps,
   CircularProgress,
   ContainerProps,
   Container as MuiContainer,
   Stack,
   Typography,
   TypographyProps,
} from "@mui/material"
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

const actionsHeight = 87

const styles = sxStyles({
   root: {},
   title: {
      letterSpacing: "-0.04886rem",
      fontSize: "2.57143rem",
      fontWeight: 600,
      lineHeight: "150%",
      textAlign: "center",
   },
   subtitle: {
      color: "text.secondary",
      textAlign: "center",
      fontSize: "1.14286rem",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "150%",
      letterSpacing: "-0.02171rem",
      mx: "auto",
   },
   container: {
      display: "flex",
      flexDirection: "column",
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
] as const

export type SparkDialogStep = (typeof views)[number]["key"]

export const useSparksForm = () => {
   console.count("useSparksForm")
   const stepper = useStepper<SparkDialogStep>()
   const dispatch = useDispatch()

   const setCreator = useCallback(
      (creator: CreatorOrNew) => {
         dispatch(setCreatorAction(creator))
      },
      [dispatch]
   )

   const setSpark = useCallback(
      (spark: SparkOrNew) => {
         dispatch(setSparkAction(spark))
      },
      [dispatch]
   )

   return useMemo(() => {
      return {
         setCreator,
         setSpark,
         stepper,
      }
   }, [setCreator, setSpark, stepper])
}

const SparksDialog = () => {
   const open = useSelector(sparksDialogOpenSelector)

   const reduxDispatch = useDispatch()

   const handleClose = useCallback(() => {
      reduxDispatch(closeSparkDialog())
   }, [reduxDispatch])

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
}

const Container: FC<SparksDialogContainerProps> = ({
   withActionsOffset,
   sx,
   ...props
}) => {
   return (
      <MuiContainer
         maxWidth="sm"
         sx={[
            styles.container,
            withActionsOffset && styles.containerWithActionsOffset,
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         {...props}
      />
   )
}

const Actions: FC<BoxProps> = ({ children, sx, ...props }) => {
   return (
      <Stack
         justifyContent={"flex-end"}
         direction="row"
         alignItems="center"
         spacing={2}
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
