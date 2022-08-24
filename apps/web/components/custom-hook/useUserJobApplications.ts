import { Job, PUBLIC_JOB_STATUSES } from "@careerfairy/shared-lib/dist/ats/Job"
import { useMemo } from "react"
import { collection, orderBy, query, where } from "firebase/firestore"
import {
   ObservableStatus,
   useFirestore,
   useFirestoreCollectionData,
} from "reactfire"
import { UserJobApplicationDocument } from "@careerfairy/shared-lib/dist/users"
import { JobStatus } from "@careerfairy/shared-lib/dist/ats/MergeResponseTypes"

type Result = {
   data: UserJobApplicationDocument[]
   status: ObservableStatus<UserJobApplicationDocument>["status"]
}

const useUserJobApplications = (
   userId: string,
   types: JobStatus[] = PUBLIC_JOB_STATUSES
): Result => {
   const collectionRef = query(
      collection(useFirestore(), "userData", userId, "jobApplications"),
      where("job.status", "in", types),
      orderBy("date", "desc")
   )

   const { data, status } =
      useFirestoreCollectionData<UserJobApplicationDocument>(
         collectionRef as any,
         {
            idField: "id", // this field will be added to the firestore object
         }
      )

   return useMemo(() => {
      // map to business model
      const applicationDocuments = data.map((document) => ({
         ...document,
         job: Job.createFromPlainObject(document.job),
      }))

      return {
         data: applicationDocuments,
         status,
      }
   }, [data])
}

export default useUserJobApplications
