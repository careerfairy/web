import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { GroupPlansDialogStep } from "components/views/checkout/GroupPlansDialog"

interface IGroupPlanState {
   plansDialogOpen: boolean
   confirmCloseSparksDialogOpen: boolean
   groupPlansForm: {
      selectedPlan: GroupPlanType | null
      initialStep: GroupPlansDialogStep
   }
}

type OpenDialogPayload = {
   selectedPlan: GroupPlanType
} | null

type CloseDialogPayload = {
   forceClose: boolean // If true, close the dialog without asking for confirmation
} | null

const initialState: IGroupPlanState = {
   plansDialogOpen: false,
   confirmCloseSparksDialogOpen: false,
   groupPlansForm: {
      selectedPlan: null,
      initialStep: "select-plan",
   },
}

export const groupPlansSlice = createSlice({
   name: "Upgrade Plan",
   initialState,
   reducers: {
      openGroupPlansDialog: (
         state,
         action: PayloadAction<OpenDialogPayload> = null
      ) => {
         state.plansDialogOpen = true

         if (action.payload) {
            if ("selectedPlan" in action.payload) {
               state.groupPlansForm.selectedPlan = action.payload.selectedPlan

               state.groupPlansForm.initialStep = "select-or-change-plan"
            }
         }
      },
      closeConfirmCloseGroupPlansDialog: (state) => {
         state.confirmCloseSparksDialogOpen = false
      },
      closeGroupPlansDialog: (
         state,
         action: PayloadAction<CloseDialogPayload>
      ) => {
         const shouldForceClose = action.payload?.forceClose
         console.log("🚀 ~ shoudlForceClose:", shouldForceClose)

         state.plansDialogOpen = false
         state.groupPlansForm.selectedPlan = null
         state.confirmCloseSparksDialogOpen = false
         state.groupPlansForm.initialStep =
            initialState.groupPlansForm.initialStep // Reset the initial step
      },
      // Actions for setting values on the form
      setPlan: (state, action: PayloadAction<GroupPlanType>) => {
         state.groupPlansForm.selectedPlan =
            action.payload || initialState.groupPlansForm.selectedPlan
      },
   },
})

// Export actions
export const {
   setPlan,
   closeGroupPlansDialog,
   closeConfirmCloseGroupPlansDialog,
   openGroupPlansDialog,
} = groupPlansSlice.actions

// Export reducer
export default groupPlansSlice.reducer
