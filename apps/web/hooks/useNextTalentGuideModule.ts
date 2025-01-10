import { reducedRemoteCallsOptions } from "components/custom-hook/utils/useFunctionsSWRFetcher"
import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { Page, TalentGuideModule } from "data/hygraph/types"
import useSWR, { SWRConfiguration } from "swr"

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
   locale: string = "en",
   options?: SWRConfiguration
) {
   return useSWR(
      userAuthUid ? `next-levels-module-${userAuthUid}-${locale}` : null,
      () => fetchNextModule(userAuthUid, locale),
      {
         ...reducedRemoteCallsOptions,
         ...options,
      }
   )
}
