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

const useRecommendedJobs = (config?: Config) => {
   const { authenticatedUser } = useAuth()

   const { limit = 10, suspense = false, forceFetch = false } = config || {}

   const key = useMemo(() => {
      return [
         "getRecommendedJobs",
         limit,
         ...(authenticatedUser?.uid
            ? [`uid=${authenticatedUser?.uid}`]
            : [`uid=anonymous`]),
         ...(config?.bypassCache ? [`bypassCache=${config?.bypassCache}`] : []),
         ...(config?.referenceJobId
            ? [`referenceJobId=${config?.referenceJobId}`]
            : []),
         ...(forceFetch ? [`forceFetchUid=${uuidv4()}`] : []),
      ]
   }, [
      limit,
      authenticatedUser?.uid,
      config?.bypassCache,
      config?.referenceJobId,
      forceFetch,
   ])

   const { data: jobs, isLoading } = useSWR<CustomJob[]>(
      key,
      async () =>
         customJobServiceInstance.getRecommendedJobs(
            limit,
            authenticatedUser?.uid,
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
   const { authenticatedUser } = useAuth()

   const key = useMemo(() => {
      return [
         "getRecommendedJobs",
         limit,
         ...(authenticatedUser?.uid
            ? [`uid=${authenticatedUser?.uid}`]
            : [`uid=anonymous`]),
         ...(config?.referenceJobId
            ? [`referenceJobId=${config?.referenceJobId}`]
            : []),
      ]
   }, [limit, authenticatedUser?.uid, config?.referenceJobId])

   useEffect(() => {
      preload(key, () =>
         customJobServiceInstance.getRecommendedJobs(
            limit,
            authenticatedUser?.uid,
            false,
            config?.referenceJobId
         )
      )
   }, [key, limit, authenticatedUser?.uid, config?.referenceJobId])

   return null
}

export default useRecommendedJobs
