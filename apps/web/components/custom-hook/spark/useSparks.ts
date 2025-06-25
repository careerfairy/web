import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import {
   collection,
   getDocs,
   limit,
   orderBy,
   query,
   where,
} from "firebase/firestore"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

type Options = {
   totalItems?: number
   groupId?: string
   /**
    * Prevents the hook from fetching the sparks
    **/
   disabled?: boolean
}

/**
 * Fetches the stats for a given spark if it belongs to the given group.
 **/
const useSparks = (options?: Options) => {
   const { totalItems = 50, groupId, disabled } = options || {}

   return useSWR(
      disabled ? null : ["get-sparks", totalItems, groupId],
      async () => {
         const querySnapshot = await getDocs(
            query(
               collection(FirestoreInstance, "sparks"),
               where("group.publicSparks", "==", true),
               where("published", "==", true),
               orderBy("publishedAt", "desc"),
               ...(groupId ? [where("group.id", "==", groupId)] : []),
               ...(totalItems ? [limit(totalItems)] : [])
            ).withConverter(createGenericConverter<Spark>())
         )

         return querySnapshot.docs.map((doc) => doc.data())
      },
      {
         ...reducedRemoteCallsOptions,
         onError: (error, key) => {
            errorLogAndNotify(error, {
               key,
               groupId,
               totalItems,
            })
         },
      }
   )
}

export default useSparks
