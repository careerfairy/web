import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { Page, TalentGuideModule } from "data/hygraph/types"
import useSWR from "swr"

// Cache key prefix for overall progress
const OVERALL_PROGRESS_KEY = "talent-guide-overall-progress"

/**
 * Custom hook to fetch overall talent guide progress
 * @param userAuthUid - The authenticated user's ID
 * @param modules - All available modules from the CMS
 * @returns SWR response with overall progress percentage
 */
export const useOverallTalentGuideProgress = (
   userAuthUid: string | undefined,
   modules: Page<TalentGuideModule>[]
) => {
   return useSWR(
      // Only fetch if we have both userAuthUid and modules
      userAuthUid ? [OVERALL_PROGRESS_KEY, userAuthUid, modules.length] : null,
      async () => {
         if (!userAuthUid) return 0
         return talentGuideProgressService.getOverallProgress(
            userAuthUid,
            modules
         )
      },
      {
         keepPreviousData: true,
      }
   )
}
