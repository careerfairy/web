import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, limit, orderBy, query, where } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

const buildMostRecentClosedPollQuery = (livestreamId: string) => {
   const pollsCollectionPath = collection(
      FirestoreInstance,
      "livestreams",
      livestreamId,
      "polls"
   )

   return query(
      pollsCollectionPath,
      where("state", "==", "closed"),
      orderBy("closedAt", "desc"),
      limit(1)
   )
}

export const useLivestreamMostRecentClosedPoll = (livestreamId: string) => {
   const ongoingPollQuery = buildMostRecentClosedPollQuery(livestreamId)

   const { data: polls } = useFirestoreCollection<LivestreamPoll>(
      ongoingPollQuery,
      reactFireOptions
   )

   return polls.length ? polls[0] : null
}
