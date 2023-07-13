import {
   CircularProgress,
   ContainerProps,
   Container as MuiContainer,
   Typography,
   TypographyProps,
} from "@mui/material"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import dynamic from "next/dynamic"
import { FC, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { closeSparkDialog } from "store/reducers/adminSparksReducer"
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
] as const

export type SparkDialogStep = (typeof views)[number]["key"]

const SparksDialog = () => {
   const open = useSelector(sparksDialogOpenSelector)

   const dispatch = useDispatch()

   const handleClose = useCallback(() => {
      dispatch(closeSparkDialog())
   }, [dispatch])

   return (
      <SteppedDialog
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

SparksDialog.Title = Title
SparksDialog.Subtitle = Subtitle
SparksDialog.Container = Container

export default SparksDialog
