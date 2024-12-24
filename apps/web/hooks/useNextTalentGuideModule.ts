import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { Page, TalentGuideModule } from "data/hygraph/types"
import useSWR from "swr"

const fetchNextModule = async (
   userAuthUid: string | null,
   locale: string = "en"
): Promise<Page<TalentGuideModule> | null> => {
   if (!userAuthUid) return null

   // Get all modules from API
   const response = await fetch(`/api/talent-guide/modules?locale=${locale}`)
   if (!response.ok) {
      throw new Error("Failed to fetch existing modules")
   }
   const allModules = (await response.json()) as Page<TalentGuideModule>[]

   // Get next module using the progress service
   return talentGuideProgressService.getNextModule(userAuthUid, allModules)
}

export function useNextTalentGuideModule(
   userAuthUid: string | null,
   locale: string = "en"
) {
   return useSWR(
      userAuthUid ? ["next-talent-guide-module", userAuthUid, locale] : null,
      () => fetchNextModule(userAuthUid, locale),
      {
         revalidateOnFocus: false,
         revalidateOnReconnect: false,
      }
   )
}
