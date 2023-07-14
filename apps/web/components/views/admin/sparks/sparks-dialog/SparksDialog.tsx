import {
   CircularProgress,
   ContainerProps,
   Container as MuiContainer,
   Typography,
   TypographyProps,
} from "@mui/material"
import { type Create } from "@careerfairy/shared-lib/commonTypes"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import dynamic from "next/dynamic"
import { FC, useCallback, useMemo, useReducer } from "react"
import { useDispatch, useSelector } from "react-redux"
import { closeSparkDialog } from "store/reducers/adminSparksReducer"
import { sparksDialogOpenSelector } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

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

type State = {
   creator: Creator | Create<Creator> // Could be a Create<Creator> if we're creating a new creator
   spark: Spark | Create<Spark> // Could be a Create<Spark> if we're creating a new spark
}

const initialState: State = {
   creator: null,
   spark: null,
}

const sparksFormSlice = createSlice({
   name: "sparksForm",
   initialState,
   reducers: {
      setCreator: (state, action: PayloadAction<State["creator"]>) => {
         state.creator = action.payload
      },
      setSpark: (state, action: PayloadAction<State["spark"]>) => {
         state.spark = action.payload
      },
   },
})

export const { setCreator, setSpark } = sparksFormSlice.actions

export const useSparksForm = () => {
   const [state, dispatch] = useReducer(sparksFormSlice.reducer, initialState)

   const setCreator = useCallback(
      (creator: State["creator"]) => {
         dispatch(sparksFormSlice.actions.setCreator(creator))
      },
      [dispatch]
   )

   const setSpark = useCallback(
      (spark: State["spark"]) => {
         dispatch(sparksFormSlice.actions.setSpark(spark))
      },
      [dispatch]
   )

   return useMemo(() => {
      return {
         state,
         setCreator,
         setSpark,
      }
   }, [state, setCreator, setSpark])
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

SparksDialog.Title = Title
SparksDialog.Subtitle = Subtitle
SparksDialog.Container = Container

export default SparksDialog
