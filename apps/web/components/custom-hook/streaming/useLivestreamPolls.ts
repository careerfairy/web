import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, orderBy, query } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

export const useLivestreamPolls = (livestreamId: string) => {
   return useFirestoreCollection<LivestreamPoll>(
      query(
         collection(FirestoreInstance, "livestreams", livestreamId, "polls"),
         orderBy("timestamp", "desc")
      ),
      reactFireOptions
   )
}
