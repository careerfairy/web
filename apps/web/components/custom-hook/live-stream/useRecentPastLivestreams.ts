import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
    collection,
    limit as firestoreLimit,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

type Options = {
   suspense?: boolean
   limit?: number
}

export const useRecentPastLivestreams = (options?: Options) => {
   const limit = options?.limit ?? 9
   const suspense = options?.suspense ?? false

   const firestore = useFirestore()

   return useSWR<LivestreamEvent[]>(
      "recent-past-livestreams",
      async () => {
         const livestreamsQuery = query(
            collection(firestore, "livestreams"),
            where("hasEnded", "==", true),
            where("test", "==", false),
            where("hidden", "==", false),
            orderBy("start", "desc"),
            firestoreLimit(limit)
         ).withConverter(createGenericConverter<LivestreamEvent>())

         const querySnapshot = await getDocs(livestreamsQuery)

         return querySnapshot.docs.map((doc) => doc.data())
      },
      {
         suspense,
         onError: (error) =>
            errorLogAndNotify(error, "Failed to fetch recent past livestreams"),
      }
   )
}