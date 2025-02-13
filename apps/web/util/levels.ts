import { Page, TalentGuideModule } from "data/hygraph/types"

export const getProgressPercentage = (
   currentStepIndex: number,
   moduleData: Page<TalentGuideModule>
) => ((currentStepIndex + 1) / moduleData.content.moduleSteps.length) * 100
