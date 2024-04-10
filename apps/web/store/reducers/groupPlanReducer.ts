import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface IGroupPlanState {
   plansDialogOpen: boolean
   confirmCloseSparksDialogOpen: boolean
   groupPlansForm: {
      selectedPlan: GroupPlanType | null
      clientSecret: string | null
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
      selectedPlan: GroupPlanTypes.Tier2,
      clientSecret: null,
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
         state.groupPlansForm = initialState.groupPlansForm
      },
      setPlan: (state, action: PayloadAction<GroupPlanType>) => {
         state.groupPlansForm.selectedPlan =
            action.payload || initialState.groupPlansForm.selectedPlan
      },
      setSecret: (state, action: PayloadAction<string>) => {
         state.groupPlansForm.clientSecret =
            action.payload || initialState.groupPlansForm.clientSecret
      },
   },
})

export const {
   setPlan,
   setSecret,
   closeGroupPlansDialog,
   closeConfirmCloseGroupPlansDialog,
   openGroupPlansDialog,
} = groupPlansSlice.actions

export default groupPlansSlice.reducer
