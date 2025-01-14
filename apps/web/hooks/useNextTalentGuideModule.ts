import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { useEffect, useRef } from "react"
import useSWR, { SWRConfiguration, useSWRConfig } from "swr"

const fetchNextModule = async (
   userAuthUid: string | null,
   locale: string = "en"
): Promise<Page<TalentGuideModule> | null> => {
   if (!userAuthUid) return null

   // Get all modules from API
   const response = await fetch(`/api/levels/modules?locale=${locale}`)
   if (!response.ok) {
      throw new Error("Failed to fetch existing modules")
   }
   const allModules = (await response.json()) as Page<TalentGuideModule>[]

   // Get next module using the progress service
   return talentGuideProgressService.getNextModule(userAuthUid, allModules)
}

/**
 * Hook to fetch the next levels module
 * @param userAuthUid - The user's auth UID
 * @param locale - The locale for the content
 * @param options - SWR configuration options
 */
export function useNextTalentGuideModule(
   userAuthUid: string | null,
   locale: string = "de",
   options?: SWRConfiguration & {
      noCache?: boolean
   }
) {
   const { cache } = useSWRConfig()
   const random = useRef(Date.now())

   const key = userAuthUid
      ? `next-levels-module-${userAuthUid}-${locale}${
           options?.noCache ? `-${random.current}` : ""
        }`
      : null

   const swr = useSWR(key, () => fetchNextModule(userAuthUid, locale), {
      ...reducedRemoteCallsOptions,
      ...options,
   })

   // Cleanup cache when component unmounts (only if noCache is true)
   useEffect(() => {
      if (!options?.noCache) return

      return () => {
         if (key) {
            cache.delete(key)
         }
      }
   }, [cache, key, options?.noCache])

   return swr
}
