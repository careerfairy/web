import { collection, limit, orderBy, query } from "firebase/firestore"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { ReactFireOptions } from "reactfire"

type Options = {
   limit: number
}

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

export const useChatEntries = (livestreamId: string, options?: Options) => {
   let q = query(
      collection(FirestoreInstance, "livestreams", livestreamId, "chatEntries"),
      orderBy("timestamp", "desc")
   )
   if (options?.limit) {
      q = query(q, limit(options.limit))
   }

   return useFirestoreCollection<LivestreamChatEntry>(q, reactFireOptions)
}
