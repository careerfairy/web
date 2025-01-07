import { useVisibleSteps } from "store/selectors/talentGuideSelectors"
import { AnimatedStepContent } from "../animations/AnimatedStepContent"
import { ModuleStepContentRenderer } from "./ModuleStepContentRenderer"
import { TalentGuideLayout } from "./TalentGuideLayout"
import { TalentGuideProgress } from "./TalentGuideProgress"
import { StepActionButton } from "./floating-buttons/StepActionButton"

export const TalentGuideStepsLayout = () => {
   const visibleSteps = useVisibleSteps()

   return (
      <TalentGuideLayout
         header={<TalentGuideProgress />}
         sx={{
            maxWidth: 600,
            px: 2,
            pt: {
               xs: 1.25,
               md: 3.5,
            },
         }}
      >
         <AnimatedStepContent>
            {visibleSteps.map((step) => (
               <ModuleStepContentRenderer key={step.id} step={step} />
            ))}
         </AnimatedStepContent>
         <StepActionButton />
      </TalentGuideLayout>
   )
}
