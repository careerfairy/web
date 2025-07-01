import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useAuth } from "HOCs/AuthProvider"
import { customJobServiceInstance } from "data/firebase/CustomJobService"
import { useEffect, useMemo } from "react"
import useSWR, { preload } from "swr"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

type Config = {
   limit?: number
   suspense?: boolean
   bypassCache?: boolean
   referenceJobId?: string
   initialData?: CustomJob[]
   userAuthId?: string
   countryCode?: string
}

export const useUserRecommendedJobs = (config?: Config) => {
   const { isLoadingAuth } = useAuth()
   const {
      limit = 10,
      suspense = false,
      userAuthId,
      bypassCache = false,
      referenceJobId,
      initialData,
      countryCode,
   } = config || {}

   const { data: jobs, isLoading } = useSWR<CustomJob[]>(
      !isLoadingAuth
         ? [
              "getRecommendedJobs",
              limit,
              ...(userAuthId ? [`userAuthId=${userAuthId}`] : []),
              ...(bypassCache ? [`bypassCache=${bypassCache}`] : []),
              ...(referenceJobId ? [`referenceJobId=${referenceJobId}`] : []),
              ...(countryCode ? [`countryCode=${countryCode}`] : []),
           ]
         : null,
      async () =>
         customJobServiceInstance.getRecommendedJobs(
            limit,
            userAuthId,
            bypassCache,
            {
               referenceJobId,
               userCountryCode: countryCode,
            }
         ),
      {
         ...reducedRemoteCallsOptions,
         suspense,
         fallbackData: initialData,
      }
   )

   return useMemo(
      () => ({
         jobs,
         loading: isLoading,
      }),
      [jobs, isLoading]
   )
}

/*
 * Hook to preload the recommended jobIds and store them in the SWR cache
 * */
export const usePreFetchRecommendedJobs = (config?: Config) => {
   const limit = config?.limit || 10
   const { authenticatedUser, isLoadingAuth } = useAuth()
   const { userAuthId, bypassCache, referenceJobId, countryCode } = config || {}

   useEffect(() => {
      preload(
         isLoadingAuth
            ? [
                 "getRecommendedJobs",
                 limit,
                 ...(userAuthId ? [`userAuthId=${userAuthId}`] : []),
                 ...(bypassCache ? [`bypassCache=${bypassCache}`] : []),
                 ...(referenceJobId
                    ? [`referenceJobId=${referenceJobId}`]
                    : []),
                 ...(countryCode ? [`countryCode=${countryCode}`] : []),
              ]
            : null,
         () =>
            customJobServiceInstance.getRecommendedJobs(
               limit,
               authenticatedUser?.uid,
               bypassCache,
               {
                  referenceJobId,
                  userCountryCode: countryCode,
               }
            )
      )
   }, [
      limit,
      authenticatedUser?.uid,
      referenceJobId,
      isLoadingAuth,
      userAuthId,
      bypassCache,
      countryCode,
   ])

   return null
}
