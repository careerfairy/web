import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

const useUserJobApplication = (userId: string, jobId: string) => {
   const jobApplicationId = `${jobId}_${userId}`

   const { data } = useFirestoreDocument<CustomJobApplicant>(
      "jobApplications",
      [jobApplicationId],
      {
         idField: "id",
      }
   )

   return {
      job: data,
      alreadyApplied: data?.completed,
   }
}

export default useUserJobApplication
