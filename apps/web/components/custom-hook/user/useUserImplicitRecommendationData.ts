import { ImplicitLivestreamRecommendationData } from "@careerfairy/shared-lib/recommendation/livestreams/ImplicitLivestreamRecommendationData"
import { useAuth } from "HOCs/AuthProvider"
import { useMemo } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

/**
 * Retrieves the user implicit recommendation data via CF
 * - Watched Events (participated or recording)
 * - Watched Sparks
 * - Applied Jobs
 * @param config Items limit.
 * @returns ImplicitLivestreamRecommendationData implicit recommendation data
 */
export const useUserImplicitRecommendationData = () => {
   const { userData } = useAuth()
   const fetcher = useFunctionsSWR()

   const key = userData
      ? [
           "getUserImplicitData",
           {
              watchedEventsLimit: 10,
              watchedSparksLimit: 20,
              appliedJobsLimit: 10,
           },
        ]
      : null

   const {
      data: implicitData,
      error,
      isLoading,
   } = useSWR<ImplicitLivestreamRecommendationData>(key, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message:
               "Error Fetching user implicit recommendation data via function",
            key,
         }),
      ...reducedRemoteCallsOptions,
      suspense: false,
   })

   return useMemo(
      () => ({
         data: implicitData,
         loading: isLoading,
         error: error,
      }),
      [error, isLoading, implicitData]
   )
}

export default useUserImplicitRecommendationData
