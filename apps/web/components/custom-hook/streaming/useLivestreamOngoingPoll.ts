import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, limit, query, where } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

const buildOngoingPollQuery = (livestreamId: string) => {
   const pollsCollectionPath = collection(
      FirestoreInstance,
      "livestreams",
      livestreamId,
      "polls"
   )
   return query(pollsCollectionPath, where("state", "==", "current"), limit(1))
}

export const useLivestreamOngoingPoll = (livestreamId: string) => {
   const ongoingPollQuery = buildOngoingPollQuery(livestreamId)

   const { data: polls } = useFirestoreCollection<LivestreamPoll>(
      ongoingPollQuery,
      reactFireOptions
   )

   return polls.length ? polls[0] : null
}
