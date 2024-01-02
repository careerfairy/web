import usePaginatedCollection, {
   UsePaginatedCollection,
} from "../utils/usePaginatedCollection"
import { useMemo } from "react"
import { collection, query, where } from "firebase/firestore"
import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"

const usePaginatedJobApplicants = (
   jobId: string,
   limit = 10,
   sort: "desc" | "asc" = "desc"
) => {
   const options: UsePaginatedCollection<CustomJobApplicant> = useMemo(
      () => ({
         query: query<CustomJobApplicant>(
            // @ts-ignore
            collection(FirestoreInstance, "jobApplications"),
            where("jobId", "==", jobId)
         ),
         limit,
         orderBy: {
            field: "appliedAt",
            direction: sort,
         },
      }),
      [jobId, limit, sort]
   )

   return usePaginatedCollection<CustomJobApplicant>(options)
}

export default usePaginatedJobApplicants
