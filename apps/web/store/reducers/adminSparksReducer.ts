import { Create } from "@careerfairy/shared-lib/commonTypes"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

// Type alias for Creator | Create<Creator>
export type CreatorOrNew = Creator | Create<Creator>

// Type alias for Spark | Create<Spark>
export type SparkOrNew = Spark | Create<Spark>

interface ISparksState {
   sparkDialogOpen: boolean
   sparksForm: {
      creator: CreatorOrNew // Could be a Create<Creator> if we're creating a new creator
      spark: SparkOrNew // Could be a Create<Spark> if we're creating a new spark
   }
}

type OpenDialogPayload = {
   creator?: CreatorOrNew
   spark?: SparkOrNew
} | null

const initialState: ISparksState = {
   sparkDialogOpen: false,
   sparksForm: {
      creator: null,
      spark: null,
   },
}

export const adminSparksSlice = createSlice({
   name: "Admin Sparks",
   initialState,
   reducers: {
      openSparkDialog: (
         state,
         action: PayloadAction<OpenDialogPayload> = null
      ) => {
         state.sparkDialogOpen = true
         state.sparksForm.creator = action.payload?.creator || null
         state.sparksForm.spark = action.payload?.spark || null
      },
      closeSparkDialog: (state) => {
         state.sparkDialogOpen = false
         state.sparksForm.creator = null
         state.sparksForm.spark = null
      },
      // Actions for setting values on the form
      setCreator: (state, action: PayloadAction<CreatorOrNew>) => {
         state.sparksForm.creator = action.payload
      },
      setSpark: (state, action: PayloadAction<SparkOrNew>) => {
         state.sparksForm.spark = action.payload
      },
   },
})

// Export actions
export const { openSparkDialog, closeSparkDialog, setCreator, setSpark } =
   adminSparksSlice.actions

// Export reducer
export default adminSparksSlice.reducer
