import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { SparkFormValues } from "components/views/admin/sparks/sparks-dialog/views/hooks/useSparkFormSubmit"

interface ISparksState {
   sparkDialogOpen: boolean
   sparksForm: {
      selectedCreatorId: string | null
      selectedSparkId: string | null
      cachedSparkFormValues: SparkFormValues | null
   }
}

type OpenDialogPayload = {
   selectedCreatorId: string
   selectedSparkId: string
} | null

const initialState: ISparksState = {
   sparkDialogOpen: false,
   sparksForm: {
      selectedCreatorId: null,
      selectedSparkId: null,
      cachedSparkFormValues: null,
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

         if (action.payload) {
            state.sparksForm.selectedCreatorId =
               action.payload.selectedCreatorId
            state.sparksForm.selectedSparkId = action.payload.selectedSparkId
         }
      },
      closeSparkDialog: (state) => {
         state.sparkDialogOpen = false
         state.sparksForm.selectedCreatorId = null
         state.sparksForm.selectedSparkId = null
         state.sparksForm.cachedSparkFormValues = null
      },
      // Actions for setting values on the form
      setCreator: (
         state,
         action: PayloadAction<ISparksState["sparksForm"]["selectedCreatorId"]>
      ) => {
         state.sparksForm.selectedCreatorId =
            action.payload || initialState.sparksForm.selectedCreatorId
      },
      setSpark: (
         state,
         action: PayloadAction<ISparksState["sparksForm"]["selectedSparkId"]>
      ) => {
         state.sparksForm.selectedSparkId =
            action.payload || initialState.sparksForm.selectedSparkId

         // Reset the cached form values when the spark changes
         state.sparksForm.cachedSparkFormValues = null
      },
      setCachedSparksFormValues: (
         state,
         action: PayloadAction<SparkFormValues | null>
      ) => {
         state.sparksForm.cachedSparkFormValues = action.payload
      },
   },
})

// Export actions
export const {
   openSparkDialog,
   closeSparkDialog,
   setCreator,
   setSpark,
   setCachedSparksFormValues,
} = adminSparksSlice.actions

// Export reducer
export default adminSparksSlice.reducer
