import { LivestreamChatEntry } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, limit, orderBy, query } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

type Options = {
   limit?: number
   sortOrder?: "asc" | "desc"
}

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

export const useChatEntries = (livestreamId: string, options?: Options) => {
   const sortOrder = options?.sortOrder || "desc"
   let q = query(
      collection(FirestoreInstance, "livestreams", livestreamId, "chatEntries"),
      orderBy("timestamp", sortOrder)
   )
   if (options?.limit) {
      q = query(q, limit(options.limit))
   }

   return useFirestoreCollection<LivestreamChatEntry>(q, reactFireOptions)
}
