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
}

const useRecommendedJobs = (config?: Config) => {
   const { userData } = useAuth()

   const limit = config?.limit || 10
   const suspense = config?.suspense || false

   const { data: jobs, isLoading } = useSWR<CustomJob[]>(
      [
         "getRecommendedJobs",
         limit,
         userData?.authId,
         ...(config?.bypassCache ? [`bypassCache=${config?.bypassCache}`] : []),
         ...(config?.referenceJobId
            ? [`referenceJobId=${config?.referenceJobId}`]
            : []),
      ],
      async () =>
         customJobServiceInstance.getRecommendedJobs(
            limit,
            userData?.authId,
            config?.bypassCache,
            config?.referenceJobId
         ),
      {
         ...reducedRemoteCallsOptions,
         suspense,
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
}
/*
 * Hook to preload the recommended jobIds and store them in the SWR cache
 * */
export const usePreFetchRecommendedJobs = (config?: PreFetchConfig) => {
   const limit = config?.limit || 10
   const { isLoggedIn } = useAuth()
   const { userData } = useAuth()

   useEffect(() => {
      preload(
         [
            "getRecommendedJobs",
            limit,
            userData?.authId,
            ...(config?.referenceJobId
               ? [`referenceJobId=${config?.referenceJobId}`]
               : []),
         ],
         () =>
            customJobServiceInstance.getRecommendedJobs(
               limit,
               userData?.authId,
               false,
               config?.referenceJobId
            )
      )
   }, [limit, isLoggedIn, userData?.authId, config?.referenceJobId])

   return null
}

export default useRecommendedJobs
