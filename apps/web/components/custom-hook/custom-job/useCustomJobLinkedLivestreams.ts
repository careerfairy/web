import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { collection, documentId, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const useCustomJobLinkedLivestreams = (job: CustomJob) => {
   const linkedLivestreams = job?.livestreams?.length
      ? job.livestreams
      : ["no-livestream-id"]

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
         idField: "id", // this field will be added to the firestore object,
         suspense: false,
         initialData: [],
      }
   )

   const { data: draftData } = useFirestoreCollection<LivestreamEvent>(
      draftLivestreamsCollectionRef,
      {
         idField: "id", // this field will be added to the firestore object
         suspense: false,
         initialData: [],
      }
   )

   return {
      publishedLivestreams: livestreamData,
      draftLivestreams: draftData,
      allLivestreams: [...livestreamData, ...draftData],
   }
}

export default useCustomJobLinkedLivestreams
