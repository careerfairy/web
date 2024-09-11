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
import { useState } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

type Options = {
   totalItems: number
   businessFunctionTagIds: string[]
   ignoreIds?: string[]
   disabled?: boolean
}

/**
 * Fetches the custom jobs according to the specified options.
 **/
const useCustomJobsByTags = (options?: Options) => {
   const {
      totalItems,
      businessFunctionTagIds,
      disabled,
      ignoreIds = [],
   } = options

   const [itemsPerBatch, setItemsPerBatch] = useState<number>(totalItems)

   const { data } = useSWR(
      disabled
         ? null
         : ["get-custom-jobs", totalItems, businessFunctionTagIds, ignoreIds],
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
               limit(itemsPerBatch)
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

   return {
      customJobs: data,
      setItemsPerBatch,
   }
}

export default useCustomJobsByTags
