import { LivestreamPollVoter } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

export const useLivestreamPollVoters = (
   livestreamId: string,
   pollId: string
) => {
   return useFirestoreCollection<LivestreamPollVoter>(
      query(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "polls",
            pollId,
            "voters"
         )
      ),
      reactFireOptions
   )
}
