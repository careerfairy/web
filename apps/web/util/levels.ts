import { Page, TalentGuideModule } from "data/hygraph/types"

export const getProgressPercentage = (
   currentStepIndex: number,
   moduleData: Page<TalentGuideModule>
) => {
   if (!moduleData.content.moduleSteps) return 0
   return ((currentStepIndex + 1) / moduleData.content.moduleSteps.length) * 100
}
