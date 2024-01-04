import { useFirestoreDocument } from "../utils/useFirestoreDocument"
import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"

const useUserJobApplication = (userId: string, jobId: string) => {
   const jobApplicationId = `${jobId}_${userId}`

   const { data } = useFirestoreDocument<CustomJobApplicant>(
      "jobApplications",
      [jobApplicationId],
      {
         idField: "id",
      }
   )

   return data
}

export default useUserJobApplication
