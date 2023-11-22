import { RootState } from "../"

export const jobsFormDialogOpenSelector = (state: RootState): boolean =>
   state.adminJobs.jobsFormDialogOpen

export const jobsPrivacyPolicyDialogOpenSelector = (
   state: RootState
): boolean => state.adminJobs.jobsPrivacyPolicyDialogOpen
