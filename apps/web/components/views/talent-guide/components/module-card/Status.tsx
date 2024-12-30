import { useModuleProgress } from "components/custom-hook/talent-guide/useModuleProgress"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { TalentGuideModule } from "data/hygraph/types"
import { ModuleCompletedChip } from "./ModuleCompletedChip"
import { ModuleInfoChip } from "./ModuleInfoChip"

type Props = {
   module: TalentGuideModule
}

export const Status = ({ module }: Props) => {
   return (
      <SuspenseWithBoundary
         fallback={
            <ModuleInfoChip
               moduleLevel={module.level}
               moduleDuration={module.moduleDuration}
            />
         }
      >
         <Content module={module} />
      </SuspenseWithBoundary>
   )
}

const Content = ({ module }: Props) => {
   const moduleProgress = useModuleProgress(module.id)

   if (moduleProgress?.completedAt) {
      return <ModuleCompletedChip />
   }

   return (
      <ModuleInfoChip
         moduleLevel={module.level}
         moduleDuration={module.moduleDuration}
         percentProgress={moduleProgress?.percentageComplete}
      />
   )
}
