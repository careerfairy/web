import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { useMemo } from "react"
import { collection, orderBy, query } from "firebase/firestore"
import { useFirestore, useFirestoreCollectionData } from "reactfire"
import { UserJobApplicationDocument } from "@careerfairy/shared-lib/dist/users"

type Result = {
   data: UserJobApplicationDocument[]
}

const useUserJobApplications = (userId: string): Result => {
   const collectionRef = query(
      collection(useFirestore(), "userData", userId, "jobApplications"),
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
