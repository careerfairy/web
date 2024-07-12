import { Job, PUBLIC_JOB_STATUSES } from "@careerfairy/shared-lib/ats/Job"
import { JobStatus } from "@careerfairy/shared-lib/ats/merge/MergeResponseTypes"
import { UserJobApplicationDocument } from "@careerfairy/shared-lib/users"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestore, useFirestoreCollectionData } from "reactfire"

type Result = {
   data: UserJobApplicationDocument[]
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

   const { data } = useFirestoreCollectionData<UserJobApplicationDocument>(
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
      }
   }, [data])
}

export default useUserJobApplications
