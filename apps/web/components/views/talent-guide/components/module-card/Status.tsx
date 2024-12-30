import { Box } from "@mui/material"
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
               moduleName={module.moduleName}
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

   if (!moduleProgress) {
      return (
         <ModuleInfoChip
            moduleName={module.moduleName}
            moduleDuration={module.moduleDuration}
            percentProgress={25}
            // percentProgress={moduleProgress?.percentageComplete}
         />
      )
   }

   if (moduleProgress.completedAt) {
      return <ModuleCompletedChip />
   }

   return <Box>Status</Box>
}
