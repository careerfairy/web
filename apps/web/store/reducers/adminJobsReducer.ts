import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface IJobsState {
   jobsFormDialogOpen: boolean
   jobsPrivacyPolicyDialogOpen: boolean
   deleteJobDialogOpen: boolean
   selectedJobId: string | null
}

const initialState: IJobsState = {
   jobsFormDialogOpen: false,
   jobsPrivacyPolicyDialogOpen: false,
   deleteJobDialogOpen: false,
   selectedJobId: null,
}

export const adminJobsSlice = createSlice({
   name: "Admin Jobs",
   initialState,
   reducers: {
      openJobFormDialog: (state, action: PayloadAction<string> = null) => {
         state.jobsFormDialogOpen = true
         state.selectedJobId = action.payload
      },
      closeJobFormDialog: (state) => {
         state.jobsFormDialogOpen = false
         state.selectedJobId = null
      },
      openPrivacyPolicyDialog: (state) => {
         state.jobsPrivacyPolicyDialogOpen = true
      },
      closePrivacyPolicyDialog: (state) => {
         state.jobsPrivacyPolicyDialogOpen = false
      },
      openDeleteJobDialogOpen: (
         state,
         action: PayloadAction<string> = null
      ) => {
         state.deleteJobDialogOpen = true
         state.selectedJobId = action.payload
      },
      closeDeleteJobDialogOpen: (state) => {
         state.deleteJobDialogOpen = false
         state.selectedJobId = null
      },
   },
})

// Export actions
export const {
   openJobFormDialog,
   closeJobFormDialog,
   openPrivacyPolicyDialog,
   closePrivacyPolicyDialog,
   openDeleteJobDialogOpen,
   closeDeleteJobDialogOpen,
} = adminJobsSlice.actions

// Export reducer
export default adminJobsSlice.reducer
