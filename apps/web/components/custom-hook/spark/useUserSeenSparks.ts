import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

/**
 * Retrieves all of the user Seen Sparks sorted by latest seen.
 * @param limit Items limit.
 * @returns Spark[]
 */
export const useUserSeenSparks = (limit: number = 10) => {
   const { userData } = useAuth()
   const fetcher = useFunctionsSWR()

   const key = userData
      ? [
           "getUserSeenSparks",
           {
              limit: limit,
           },
        ]
      : null

   const {
      data: sparks,
      error,
      isLoading,
   } = useSWR<Spark[]>(key, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Error Fetching user SeenSparks by IDs via function",
            key,
         }),
      ...reducedRemoteCallsOptions,
      suspense: false,
   })

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
