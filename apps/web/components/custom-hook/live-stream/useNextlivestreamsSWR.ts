import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   LivestreamEvent,
   getEarliestEventBufferTime,
} from "@careerfairy/shared-lib/livestreams"
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
   includeHidden?: boolean
}

export const useNextLivestreamsSWR = (options?: Options) => {
   const limit = options?.limit ?? 10
   const suspense = options?.suspense ?? false
   const includeHidden = options?.includeHidden ?? false

   const firestore = useFirestore()

   return useSWR<LivestreamEvent[]>(
      "next-livestreams",
      async () => {
         const livestreamsQuery = query(
            collection(firestore, "livestreams"),
            where("start", ">", getEarliestEventBufferTime()),
            where("test", "==", false),
            orderBy("start", "asc"),
            ...(includeHidden ? [] : [where("hidden", "==", false)]),
            firestoreLimit(limit)
         ).withConverter(createGenericConverter<LivestreamEvent>())

         const querySnapshot = await getDocs(livestreamsQuery)

         return querySnapshot.docs.map((doc) => doc.data())
      },
      {
         suspense,
         onError: (error) =>
            errorLogAndNotify(error, "Failed to fetch next livestreams"),
      }
   )
}
