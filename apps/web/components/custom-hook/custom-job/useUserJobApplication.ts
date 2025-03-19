import {
   AnonymousJobApplication,
   CustomJobApplicant,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import useFingerPrint from "../useFingerPrint"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

const useUserJobApplication = (
   userId: string,
   jobId: string,
   suspense: boolean = false
) => {
   const { data: fingerPrintId } = useFingerPrint()
   const jobApplicationId = `${jobId}_${userId}`
   const anonApplicationId = `${jobId}_${fingerPrintId}`

   const { data } = useFirestoreDocument<CustomJobApplicant>(
      "jobApplications",
      [jobApplicationId],
      {
         idField: "id",
         suspense,
      }
   )

   const { data: anonApplicationData } =
      useFirestoreDocument<AnonymousJobApplication>(
         "anonymousJobApplications",
         [anonApplicationId],
         {
            idField: "id",
            suspense,
         }
      )

   const applicationInitiatedOnly: boolean =
      Boolean(data || anonApplicationData) &&
      !(data?.applied || anonApplicationData?.applied)

   const alreadyApplied = data?.applied || anonApplicationData?.applied
   return {
      job: data,
      alreadyApplied,
      applicationInitiatedOnly,
   }
}

export default useUserJobApplication
