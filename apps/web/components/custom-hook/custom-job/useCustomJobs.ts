import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
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
   businessFunctionTagIds?: string[]
   disabled?: boolean
}

/**
 * Fetches the stats for a given spark if it belongs to the given group.
 **/
const useCustomJobs = (options?: Options) => {
   const { totalItems = 3, businessFunctionTagIds = [], disabled } = options

   return useSWR(
      disabled ? null : ["get-custom-jobs", totalItems, businessFunctionTagIds],
      async () => {
         const querySnapshot = await getDocs(
            query(
               collection(FirestoreInstance, "customJobs"),
               where("deadline", ">", new Date()),
               orderBy("deadline", "desc"),
               ...(businessFunctionTagIds.length
                  ? [
                       where(
                          "businessFunctionsTagIds",
                          "array-contains",
                          businessFunctionTagIds
                       ),
                    ]
                  : []),
               ...(totalItems ? [limit(totalItems)] : [])
            ).withConverter(createGenericConverter<CustomJob>())
         )

         return querySnapshot.docs.map((doc) => doc.data())
      },
      {
         ...reducedRemoteCallsOptions,
         onError: (error, key) => {
            errorLogAndNotify(error, {
               key,
               businessFunctionTagIds,
               totalItems,
            })
         },
      }
   )
}

export default useCustomJobs
