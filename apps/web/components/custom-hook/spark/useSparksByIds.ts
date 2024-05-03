import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { useMemo } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const functionName = "getSparksByIds"

/**
 * TODO: Add documentation and error notification
 * @param sparkIds
 * @param limit
 * @returns
 */
const useSparksByIds = (sparkIds: string[]) => {
   const fetcher = useFunctionsSWR()

   const {
      data: sparks,
      error,
      isLoading,
   } = useSWR<Spark[]>(
      [
         functionName,
         {
            sparkIds: sparkIds,
         },
      ],
      fetcher,
      {
         onError: (error, key) =>
            errorLogAndNotify(error, {
               message: "Error Fetching Sparks by IDs",
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

export default useSparksByIds
