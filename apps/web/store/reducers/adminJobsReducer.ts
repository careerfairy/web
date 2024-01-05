import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface IJobsState {
   jobsDialogOpen: boolean
   deleteJobDialogOpen: boolean
   deleteJobWithLinkedLivestreamsDialogOpen: boolean
   selectedJobId: string | null
}

const initialState: IJobsState = {
   jobsDialogOpen: false,
   deleteJobDialogOpen: false,
   deleteJobWithLinkedLivestreamsDialogOpen: false,
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
         state.deleteJobDialogOpen = false
         state.selectedJobId = null
         state.deleteJobWithLinkedLivestreamsDialogOpen = false
      },
      openDeleteJobDialogOpen: (
         state,
         action: PayloadAction<string> = null
      ) => {
         state.deleteJobDialogOpen = true
         state.selectedJobId = action.payload
      },
      openDeleteJobWithLinkedLivestreams: (state) => {
         state.deleteJobWithLinkedLivestreamsDialogOpen = true
      },
   },
})

// Export actions
export const {
   openDeleteJobWithLinkedLivestreams,
   openJobsDialog,
   closeJobsDialog,
   openDeleteJobDialogOpen,
} = adminJobsSlice.actions

// Export reducer
export default adminJobsSlice.reducer
