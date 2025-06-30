import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useAuth } from "HOCs/AuthProvider"
import { customJobServiceInstance } from "data/firebase/CustomJobService"
import { useEffect, useMemo } from "react"
import useSWR, { preload } from "swr"
import { v4 as uuidv4 } from "uuid"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

type Config = {
   limit?: number
   suspense?: boolean
   bypassCache?: boolean
   referenceJobId?: string
   initialData?: CustomJob[]
   forceFetch?: boolean
}

export const useUserRecommendedJobs = (
   config?: Config & { userAuthId: string }
) => {
   const {
      limit = 10,
      suspense = false,
      forceFetch = false,
      userAuthId,
   } = config || {}

   const key = useMemo(() => {
      if (!userAuthId) return null

      return [
         "getRecommendedJobs",
         limit,
         userAuthId,
         ...(config?.bypassCache ? [`bypassCache=${config?.bypassCache}`] : []),
         ...(config?.referenceJobId
            ? [`referenceJobId=${config?.referenceJobId}`]
            : []),
         ...(forceFetch ? [`forceFetchUid=${uuidv4()}`] : []),
      ]
   }, [
      limit,
      userAuthId,
      config?.bypassCache,
      config?.referenceJobId,
      forceFetch,
   ])
   const { data: jobs, isLoading } = useSWR<CustomJob[]>(
      key,
      async () =>
         customJobServiceInstance.getRecommendedJobs(
            limit,
            userAuthId,
            config?.bypassCache,
            config?.referenceJobId
         ),
      {
         ...reducedRemoteCallsOptions,
         suspense,
         fallbackData: config?.initialData,
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

export const useAnonymousRecommendedJobs = (config?: Config) => {
   const { limit = 10, suspense = false, forceFetch = false } = config || {}

   const key = useMemo(() => {
      return [
         "getRecommendedJobs-anonymous",
         limit,
         ...(config?.bypassCache ? [`bypassCache=${config?.bypassCache}`] : []),
         ...(config?.referenceJobId
            ? [`referenceJobId=${config?.referenceJobId}`]
            : []),
         ...(forceFetch ? [`forceFetchUid=${uuidv4()}`] : []),
      ]
   }, [limit, config?.bypassCache, config?.referenceJobId, forceFetch])
   const { data: jobs, isLoading } = useSWR<CustomJob[]>(
      key,
      async () =>
         customJobServiceInstance.getRecommendedJobs(
            limit,
            null,
            config?.bypassCache,
            config?.referenceJobId
         ),
      {
         ...reducedRemoteCallsOptions,
         suspense,
         fallbackData: config?.initialData,
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
