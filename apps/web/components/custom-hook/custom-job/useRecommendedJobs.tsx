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
}

export const useUserRecommendedJobs = (config?: Config) => {
   const {
      limit = 10,
      suspense = false,
      userAuthId,
      bypassCache = false,
      referenceJobId,
      initialData,
   } = config || {}

   const { data: jobs, isLoading } = useSWR<CustomJob[]>(
      [
         "getRecommendedJobs",
         limit,
         ...(userAuthId ? [`userAuthId=${userAuthId}`] : []),
         ...(bypassCache ? [`bypassCache=${bypassCache}`] : []),
         ...(referenceJobId ? [`referenceJobId=${referenceJobId}`] : []),
      ],
      async () =>
         customJobServiceInstance.getRecommendedJobs(
            limit,
            userAuthId,
            bypassCache,
            referenceJobId
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

type PreFetchConfig = {
   limit?: number
   referenceJobId?: string
   initialData?: CustomJob[]
}

/*
 * Hook to preload the recommended jobIds and store them in the SWR cache
 * */
export const usePreFetchRecommendedJobs = (config?: PreFetchConfig) => {
   const limit = config?.limit || 10
   const { authenticatedUser, isLoggedIn } = useAuth()

   useEffect(() => {
      preload(
         [
            "getRecommendedJobs",
            limit,
            ...(authenticatedUser?.uid
               ? [`uid=${authenticatedUser?.uid}`]
               : []),
         ],
         () =>
            customJobServiceInstance.getRecommendedJobs(
               limit,
               authenticatedUser?.uid,
               false,
               config?.referenceJobId
            )
      )
   }, [limit, isLoggedIn, authenticatedUser?.uid, config?.referenceJobId])

   return null
}
