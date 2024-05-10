import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { useMemo } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const functionName = "getUserSeenSparks"

/**
 * Retrieves all of the user Seen Sparks sorted by latest seen.
 * @param limit Items limit.
 * @returns Spark[]
 */
export const useUserSeenSparks = (limit?: number) => {
   if (!limit) limit = 10
   const fetcher = useFunctionsSWR()

   const {
      data: sparks,
      error,
      isLoading,
   } = useSWR<Spark[]>(
      [
         functionName,
         {
            limit: limit,
         },
      ],
      fetcher,
      {
         onError: (error, key) =>
            errorLogAndNotify(error, {
               message: "Error Fetching user SeenSparks by IDs via function",
               key,
            }),
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )

   return useMemo(
      () => ({
         sparks: sparks,
         loading: isLoading,
         error: error,
      }),
      [error, isLoading, sparks]
   )
}

export default useUserSeenSparks
