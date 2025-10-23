import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { collection, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import usePaginatedCollection, {
   UsePaginatedCollection,
} from "../utils/usePaginatedCollection"

const usePaginatedJobApplicants = (
   jobId: string,
   limit = 10,
   sort: "desc" | "asc" = "desc"
) => {
   const options = useMemo(
      () => ({
         query: query(
            // @ts-ignore
            collection(FirestoreInstance, "jobApplications"),
            where("jobId", "==", jobId),
            where("applied", "==", true)
         ),
         limit,
         orderBy: {
            field: "appliedAt",
            direction: sort,
         },
      }),
      [jobId, limit, sort]
   )

   return usePaginatedCollection<CustomJobApplicant>(
      options as UsePaginatedCollection<CustomJobApplicant>
   )
}

export default usePaginatedJobApplicants
