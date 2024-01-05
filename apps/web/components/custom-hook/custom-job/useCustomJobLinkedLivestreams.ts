import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { collection, documentId, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

const useCustomJobLinkedLivestreams = (job: CustomJob) => {
   const linkedLivestreams = job?.livestreams || []

   const livestreamsCollectionRef = query(
      collection(FirestoreInstance, "livestreams"),
      where(documentId(), "in", linkedLivestreams)
   )
   const draftLivestreamsCollectionRef = query(
      collection(FirestoreInstance, "draftLivestreams"),
      where(documentId(), "in", linkedLivestreams)
   )

   const { data: livestreamData } = useFirestoreCollection<LivestreamEvent>(
      livestreamsCollectionRef,
      {
         idField: "id", // this field will be added to the firestore object
      }
   )

   const { data: draftData } = useFirestoreCollection<LivestreamEvent>(
      draftLivestreamsCollectionRef,
      {
         idField: "id", // this field will be added to the firestore object
      }
   )

   return [...livestreamData, ...draftData]
}

export default useCustomJobLinkedLivestreams
