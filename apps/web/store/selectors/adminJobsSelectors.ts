import { RootState } from "../"

export const jobsDialogOpenSelector = (state: RootState): boolean =>
   state.adminJobs.jobsDialogOpen

export const jobsFormSelectedJobIdSelector = (state: RootState): string =>
   state.adminJobs.selectedJobId

export const deleteJobsDialogOpenSelector = (state: RootState): boolean =>
   state.adminJobs.deleteJobDialogOpen
