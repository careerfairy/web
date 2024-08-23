import { LivestreamCTA } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, orderBy, query } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { useFirestoreCollection } from "../../utils/useFirestoreCollection"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

export const useLivestreamCTA = (livestreamId: string) => {
   return useFirestoreCollection<LivestreamCTA>(
      query(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "callToActions"
         ),
         orderBy("createdAt", "desc")
      ),
      reactFireOptions
   )
}
