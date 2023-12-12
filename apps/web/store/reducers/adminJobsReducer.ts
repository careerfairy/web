import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface IJobsState {
   jobsDialogOpen: boolean
   deleteJobDialogOpen: boolean
   selectedJobId: string | null
}

const initialState: IJobsState = {
   jobsDialogOpen: false,
   deleteJobDialogOpen: false,
   selectedJobId: null,
}

export const adminJobsSlice = createSlice({
   name: "Admin Jobs",
   initialState,
   reducers: {
      openJobsDialog: (state, action: PayloadAction<string> = null) => {
         state.jobsDialogOpen = true
         state.selectedJobId = action.payload
      },
      closeJobsDialog: (state) => {
         state.jobsDialogOpen = false
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
   openJobsDialog,
   closeJobsDialog,
   openDeleteJobDialogOpen,
   closeDeleteJobDialogOpen,
} = adminJobsSlice.actions

// Export reducer
export default adminJobsSlice.reducer
