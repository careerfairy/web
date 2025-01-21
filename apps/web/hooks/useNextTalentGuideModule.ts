import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { useEffect, useRef } from "react"
import useSWR, { SWRConfiguration, useSWRConfig } from "swr"

const fetchNextModule = async (
   userAuthUid: string | null,
   locale: string = "en"
): Promise<Page<TalentGuideModule> | null> => {
   // Get all modules from API
   const response = await fetch(`/api/levels/modules?locale=${locale}`)
   if (!response.ok) {
      throw new Error("Failed to fetch existing modules")
   }
   const allModules = (await response.json()) as Page<TalentGuideModule>[]

   if (!userAuthUid && allModules.length) {
      return allModules[0] // Return the first module if no user is logged in
   }

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

   const key = `next-levels-module-${userAuthUid}-${locale}${
      options?.noCache ? `-${random.current}` : ""
   }`

   const swr = useSWR(key, () => fetchNextModule(userAuthUid, locale), {
      ...reducedRemoteCallsOptions,
      ...options,
      suspense: false,
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
