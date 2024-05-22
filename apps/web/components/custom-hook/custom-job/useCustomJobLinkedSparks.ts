import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { collection, documentId, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const useCustomJobLinkedSparks = (job: CustomJob) => {
   const linkedSparks = job?.sparks?.length > 0 ? job.sparks : ["no-spark-id"]

   const sparksCollectionRef = query(
      collection(FirestoreInstance, "sparks"),
      where(documentId(), "in", linkedSparks)
   )

   const { data: sparkData } = useFirestoreCollection<Spark>(
      sparksCollectionRef,
      {
         idField: "id", // this field will be added to the firestore object
      }
   )

   return sparkData
}

export default useCustomJobLinkedSparks
