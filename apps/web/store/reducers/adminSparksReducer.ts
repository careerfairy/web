import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { SparkFormValues } from "components/views/admin/sparks/sparks-dialog/views/hooks/useSparkFormSubmit"

interface ISparksState {
   sparkDialogOpen: boolean
   confirmCloseSparksDialogOpen: boolean
   sparksForm: {
      selectedCreatorId: string | null
      selectedSparkId: string | null
      cachedSparkFormValues: SparkFormValues | null
   }
   showHiddenSparks: boolean
}

type OpenDialogPayload = {
   selectedCreatorId: string
   selectedSparkId: string
} | null

type CloseDialogPayload = {
   forceClose: boolean // If true, close the dialog without asking for confirmation
} | null

const initialState: ISparksState = {
   sparkDialogOpen: false,
   confirmCloseSparksDialogOpen: false,
   sparksForm: {
      selectedCreatorId: null,
      selectedSparkId: null,
      cachedSparkFormValues: null,
   },
   showHiddenSparks: false,
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
      closeConfirmCloseSparksDialog: (state) => {
         state.confirmCloseSparksDialogOpen = false
      },
      closeSparkDialog: (state, action: PayloadAction<CloseDialogPayload>) => {
         const shoudlForceClose = action.payload?.forceClose

         const isEditting = Boolean(
            state.sparksForm.selectedCreatorId ||
               state.sparksForm.selectedSparkId
         )

         // If the user is editting a spark and the dialog is not being force closed,
         if (isEditting && !shoudlForceClose) {
            state.confirmCloseSparksDialogOpen = true
            return
         }

         state.sparkDialogOpen = false
         state.sparksForm.selectedCreatorId = null
         state.sparksForm.selectedSparkId = null
         state.sparksForm.cachedSparkFormValues = null
         state.confirmCloseSparksDialogOpen = false
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

      // Actions for toggling visibility
      toggleShowHiddenSparks: (state) => {
         state.showHiddenSparks = !state.showHiddenSparks
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
   closeConfirmCloseSparksDialog,
   toggleShowHiddenSparks,
} = adminSparksSlice.actions

// Export reducer
export default adminSparksSlice.reducer
