import useUserJobApplications from "./useUserJobApplications"

export const useUserInitiatedJobs = (userId: string) => {
   return useUserJobApplications(userId, false)
}
