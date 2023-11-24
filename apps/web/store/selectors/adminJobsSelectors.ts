import { RootState } from "../"

export const jobsFormDialogOpenSelector = (state: RootState): boolean =>
   state.adminJobs.jobsFormDialogOpen

export const jobsPrivacyPolicyDialogOpenSelector = (
   state: RootState
): boolean => state.adminJobs.jobsPrivacyPolicyDialogOpen

export const jobsFormSelectedJobIdSelector = (state: RootState): string =>
   state.adminJobs.selectedJobId

export const deleteJobsDialogOpenSelector = (state: RootState): boolean =>
   state.adminJobs.deleteJobDialogOpen
