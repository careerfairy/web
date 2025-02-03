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
   businessFunctionTagIds: string[]
   jobTypesIds?: string[]
   ignoreIds?: string[]
   disabled?: boolean
}

/**
 * Fetches the custom jobs according to the specified options.
 **/
const useCustomJobs = (options?: Options) => {
   const {
      totalItems,
      businessFunctionTagIds,
      jobTypesIds,
      disabled,
      ignoreIds = [],
   } = options

   // Due to limitations, cannot filter id using 'not-in' as deadline is also used with inequality operator
   // so filtering the ignore ids is done in memory

   const { data, isLoading } = useSWR(
      disabled
         ? null
         : [
              "get-custom-jobs-by-tags",
              totalItems,
              businessFunctionTagIds,
              jobTypesIds,
              ignoreIds,
           ],
      async () => {
         const querySnapshot = await getDocs(
            query(
               collection(FirestoreInstance, "customJobs"),
               where("deadline", ">", new Date()),
               where("published", "==", true),
               orderBy("deadline", "asc"),
               ...(businessFunctionTagIds?.length
                  ? [
                       where(
                          "businessFunctionsTagIds",
                          "array-contains-any",
                          businessFunctionTagIds
                       ),
                    ]
                  : []),
               ...(jobTypesIds?.length
                  ? [where("jobType", "in", jobTypesIds)]
                  : []),
               ...(totalItems ? [limit(totalItems)] : [])
            ).withConverter(createGenericConverter<CustomJob>())
         )

         return (
            querySnapshot.docs
               ?.map((doc) => doc.data())
               ?.filter((job) => !ignoreIds.includes(job.id)) || []
         )
      },
      {
         ...reducedRemoteCallsOptions,
         onError: (error, key) => {
            errorLogAndNotify(error, {
               key,
               businessFunctionTagIds,
               ignoreIds,
               totalItems,
            })
         },
         suspense: false,
      }
   )

   return {
      customJobs: data || [],
      isLoading,
   }
}

export default useCustomJobs
