import useUserJobApplications from "./useUserJobApplications"

export const useUserAppliedJobs = (userId: string) => {
   return useUserJobApplications(userId, true)
}
