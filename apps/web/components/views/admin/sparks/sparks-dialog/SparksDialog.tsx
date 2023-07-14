import {
   CircularProgress,
   ContainerProps,
   Container as MuiContainer,
   Typography,
   TypographyProps,
   Box,
   BoxProps,
   ButtonProps,
   Button,
   Stack,
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
} from "store/reducers/adminSparksReducer"
import { sparksDialogOpenSelector } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"

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
   fixedBottomContent: {
      position: "fixed",
      bottom: 0,
      left: "100%",
      width: "100%",
      p: 2.5,
      borderTop: "1px solid #F0F0F0",
      height: 87,
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
   const stepper = useStepper<SparkDialogStep>()
   const dispatch = useDispatch()

   const setCreator = useCallback(
      (creator: CreatorOrNew) => {
         dispatch(setCreator(creator))
      },
      [dispatch]
   )

   const setSpark = useCallback(
      (spark: SparkOrNew) => {
         dispatch(setSpark(spark))
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

const Container: FC<ContainerProps> = (props) => {
   return <MuiContainer maxWidth="sm" sx={styles.container} {...props} />
}

const Actions: FC<BoxProps> = ({ children, sx, ...props }) => {
   return (
      <Stack
         justifyContent={"flex-end"}
         direction="row"
         alignItems="center"
         sx={[...(Array.isArray(sx) ? sx : [sx]), styles.fixedBottomContent]}
         {...props}
      >
         {children}
      </Stack>
   )
}

const CustomButton: FC<ButtonProps> = ({ children, sx, ...props }) => {
   return (
      <span>
         <Button color="secondary" {...props}>
            {children}
         </Button>
      </span>
   )
}

SparksDialog.Title = Title
SparksDialog.Subtitle = Subtitle
SparksDialog.Container = Container
SparksDialog.Actions = Actions
SparksDialog.Button = CustomButton

export default SparksDialog
