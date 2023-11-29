import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface IJobsState {
   jobsFormDialogOpen: boolean
   jobsPrivacyPolicyDialogOpen: boolean
   jobsForm: {
      selectedJobId: string | null
   }
}

const initialState: IJobsState = {
   jobsFormDialogOpen: false,
   jobsPrivacyPolicyDialogOpen: false,
   jobsForm: {
      selectedJobId: null,
   },
}

export const adminJobsSlice = createSlice({
   name: "Admin Jobs",
   initialState,
   reducers: {
      openJobFormDialog: (state, action: PayloadAction<string> = null) => {
         state.jobsFormDialogOpen = true
         state.jobsForm.selectedJobId = action.payload
      },
      closeJobFormDialog: (state) => {
         state.jobsFormDialogOpen = false
         state.jobsForm.selectedJobId = null
      },
      openPrivacyPolicyDialog: (state) => {
         state.jobsPrivacyPolicyDialogOpen = true
      },
      closePrivacyPolicyDialog: (state) => {
         state.jobsPrivacyPolicyDialogOpen = false
      },
   },
})

// Export actions
export const {
   openJobFormDialog,
   closeJobFormDialog,
   openPrivacyPolicyDialog,
   closePrivacyPolicyDialog,
} = adminJobsSlice.actions

// Export reducer
export default adminJobsSlice.reducer
