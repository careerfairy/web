import { PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { SparkDialogStep } from "components/views/admin/sparks/sparks-dialog/SparksDialog"
import { SparkFormValues } from "components/views/admin/sparks/sparks-dialog/views/hooks/useSparkFormSubmit"

interface ISparksState {
   sparkDialogOpen: boolean
   confirmCloseSparksDialogOpen: boolean
   sparksForm: {
      selectedPublicCreator: PublicCreator | null
      selectedSparkId: string | null
      cachedSparkFormValues: SparkFormValues | null
      initialStep: SparkDialogStep
   }
   showHiddenSparks: boolean
   sparkToPreview: string | null
}

type OpenDialogPayload =
   | {
        selectedSparkId: string
     }
   | {
        selectedPublicCreator: PublicCreator
     }
   | null

type CloseDialogPayload = {
   forceClose: boolean // If true, close the dialog without asking for confirmation
} | null

const initialState: ISparksState = {
   sparkDialogOpen: false,
   confirmCloseSparksDialogOpen: false,
   sparksForm: {
      selectedPublicCreator: null,
      selectedSparkId: null,
      cachedSparkFormValues: null,
      initialStep: "select-creator",
   },
   showHiddenSparks: true,
   sparkToPreview: null,
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
            if ("selectedSparkId" in action.payload) {
               state.sparksForm.selectedSparkId = action.payload.selectedSparkId
               state.sparksForm.initialStep = "create-or-edit-spark"
            }

            if ("selectedPublicCreator" in action.payload) {
               state.sparksForm.selectedPublicCreator =
                  action.payload.selectedPublicCreator

               state.sparksForm.initialStep = "create-or-edit-creator"
            }

            state.sparksForm.cachedSparkFormValues = null
         }
      },
      closeConfirmCloseSparksDialog: (state) => {
         state.confirmCloseSparksDialogOpen = false
      },
      closeSparkDialog: (state, action: PayloadAction<CloseDialogPayload>) => {
         const shoudlForceClose = action.payload?.forceClose

         const isEditting = Boolean(
            state.sparksForm.selectedPublicCreator ||
               state.sparksForm.selectedSparkId
         )

         // If the user is editting a spark and the dialog is not being force closed,
         if (isEditting && !shoudlForceClose) {
            state.confirmCloseSparksDialogOpen = true
            return
         }

         state.sparkDialogOpen = false
         state.sparksForm.selectedPublicCreator = null
         state.sparksForm.selectedSparkId = null
         state.sparksForm.cachedSparkFormValues = null
         state.confirmCloseSparksDialogOpen = false
         state.sparksForm.initialStep = initialState.sparksForm.initialStep // Reset the initial step
      },
      // Actions for setting values on the form
      setCreator: (
         state,
         action: PayloadAction<
            ISparksState["sparksForm"]["selectedPublicCreator"]
         >
      ) => {
         state.sparksForm.selectedPublicCreator =
            action.payload || initialState.sparksForm.selectedPublicCreator
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

      // Actions for previewing sparks
      setSparkToPreview: (
         state,
         action: PayloadAction<ISparksState["sparkToPreview"]>
      ) => {
         state.sparkToPreview = action.payload
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
   setSparkToPreview,
} = adminSparksSlice.actions

// Export reducer
export default adminSparksSlice.reducer
