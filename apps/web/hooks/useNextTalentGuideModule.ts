import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { tgBackendService } from "data/hygraph/TalentGuideBackendService"
import { Page, TalentGuideModule } from "data/hygraph/types"
import useSWR from "swr"

const fetchNextModule = async (
   userAuthUid: string | null,
   locale: string = "en"
): Promise<Page<TalentGuideModule> | null> => {
   if (!userAuthUid) return null

   // Get all modules from CMS
   const allModules = await tgBackendService.getAllTalentGuideModulePages(
      locale
   )

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
