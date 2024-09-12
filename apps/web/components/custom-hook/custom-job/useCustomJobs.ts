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
import useCountQuery from "../useCountQuery"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

type Options = {
   totalItems?: number
   businessFunctionTagIds: string[]
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
      disabled,
      ignoreIds = [],
   } = options

   // Due to limitations, cannot filter id using 'not-in' as deadline is also used with inequality operator
   // so filtering the ignore ids is done in memory

   const { data } = useSWR(
      disabled
         ? null
         : [
              "get-custom-jobs-by-tags",
              totalItems,
              businessFunctionTagIds,
              ignoreIds,
           ],
      async () => {
         const querySnapshot = await getDocs(
            query(
               collection(FirestoreInstance, "customJobs"),
               where("deadline", ">", new Date()),
               where("published", "==", true),
               orderBy("deadline", "desc"),
               ...(businessFunctionTagIds.length
                  ? [
                       where(
                          "businessFunctionsTagIds",
                          "array-contains-any",
                          businessFunctionTagIds
                       ),
                    ]
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
      }
   )

   return {
      customJobs: data,
   }
}

export const useCustomJobsCount = (options?: Options) => {
   const { businessFunctionTagIds } = options
   const countQuery = query(
      collection(FirestoreInstance, "customJobs"),
      where("deadline", ">", new Date()),
      where("published", "==", true),
      orderBy("deadline", "desc"),
      ...(businessFunctionTagIds.length
         ? [
              where(
                 "businessFunctionsTagIds",
                 "array-contains-any",
                 businessFunctionTagIds
              ),
           ]
         : [])
   )

   return useCountQuery(countQuery)
}

export default useCustomJobs
