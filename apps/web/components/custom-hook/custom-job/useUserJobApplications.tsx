import {
   CustomJobApplicant,
   sortCustomJobs,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { collection, orderBy, query, where } from "firebase/firestore"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const useUserJobApplications = (userId: string, applied: boolean) => {
   const collectionRef = query(
      collection(useFirestore(), "jobApplications"),
      where("user.id", "==", userId),
      where("applied", "==", applied),
      where("job.documentType", "==", "customJobs"),
      where("removedFromUserProfile", "==", false),
      orderBy("job.deadline", "asc")
   )

   const { data } = useFirestoreCollection<CustomJobApplicant>(collectionRef, {
      idField: "id", // this field will be added to the firestore object
   })

   const customJobs = (data || []).map((jobApplication) => jobApplication.job)

   const sortedJobs = sortCustomJobs(customJobs)
   return sortedJobs
}

export default useUserJobApplications
