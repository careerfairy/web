import { useModuleProgress } from "components/custom-hook/talent-guide/useModuleProgress"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { TalentGuideModule } from "data/hygraph/types"
import { ModuleCompletedChip } from "./ModuleCompletedChip"
import { ModuleInfoChip } from "./ModuleInfoChip"

type Props = {
   module: TalentGuideModule
   onShineAnimationComplete?: () => void
}

export const Status = ({ module, onShineAnimationComplete }: Props) => {
   return (
      <SuspenseWithBoundary
         fallback={
            <ModuleInfoChip
               moduleLevel={module.level}
               moduleDuration={module.moduleDuration}
               estimatedModuleDurationMinutes={
                  module.estimatedModuleDurationMinutes
               }
            />
         }
      >
         <Content
            module={module}
            onShineAnimationComplete={onShineAnimationComplete}
         />
      </SuspenseWithBoundary>
   )
}

const Content = ({ module, onShineAnimationComplete }: Props) => {
   const moduleProgress = useModuleProgress(module.id)

   if (moduleProgress?.completedAt) {
      return (
         <ModuleCompletedChip
            onShineAnimationComplete={onShineAnimationComplete}
         />
      )
   }

   return (
      <ModuleInfoChip
         moduleLevel={module.level}
         moduleDuration={module.moduleDuration}
         estimatedModuleDurationMinutes={module.estimatedModuleDurationMinutes}
         percentProgress={moduleProgress?.percentageComplete}
      />
   )
}
