import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { GroupPlansDialogStep } from "components/views/checkout/GroupPlansDialog"

interface IGroupPlanState {
   plansDialogOpen: boolean
   confirmCloseSparksDialogOpen: boolean
   groupPlansForm: {
      selectedPlan: GroupPlanType | null
      clientSecret: string | null
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
      selectedPlan: GroupPlanTypes.Advanced,
      clientSecret: null,
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

               state.groupPlansForm.initialStep = "checkout"
            }
         }
      },
      closeConfirmCloseGroupPlansDialog: (state) => {
         state.confirmCloseSparksDialogOpen = false
      },
      closeGroupPlansDialog: (
         state,
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         action: PayloadAction<CloseDialogPayload>
      ) => {
         state.plansDialogOpen = false
         state.groupPlansForm.selectedPlan = null
         state.confirmCloseSparksDialogOpen = false
         state.groupPlansForm = initialState.groupPlansForm // Reset the initial state completely
      },
      // Actions for setting values on the form
      setPlan: (state, action: PayloadAction<GroupPlanType>) => {
         state.groupPlansForm.selectedPlan =
            action.payload || initialState.groupPlansForm.selectedPlan
      },
      // Actions for setting values on the form
      setSecret: (state, action: PayloadAction<string>) => {
         console.log("🚀 ~ setting client secret:", action)
         state.groupPlansForm.clientSecret =
            action.payload || initialState.groupPlansForm.clientSecret
      },
   },
})

// Export actions
export const {
   setPlan,
   setSecret,
   closeGroupPlansDialog,
   closeConfirmCloseGroupPlansDialog,
   openGroupPlansDialog,
} = groupPlansSlice.actions

// Export reducer
export default groupPlansSlice.reducer
