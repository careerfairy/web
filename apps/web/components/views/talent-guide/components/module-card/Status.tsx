import { Skeleton } from "@mui/material"
import { useModuleProgress } from "components/custom-hook/talent-guide/useModuleProgress"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { TalentGuideModule } from "data/hygraph/types"
import { useAuth } from "HOCs/AuthProvider"
import { ModuleCompletedChip } from "./ModuleCompletedChip"
import { ModuleInfoChip } from "./ModuleInfoChip"
import { statusStyles } from "./styles"

type Props = {
   module: TalentGuideModule
   onShineAnimationComplete?: () => void
}

export const Status = ({ module, onShineAnimationComplete }: Props) => {
   const { isLoggedOut, isLoadingAuth } = useAuth()

   const fallBack = (
      <ModuleInfoChip
         moduleLevel={module.level}
         estimatedModuleDurationMinutes={module.estimatedModuleDurationMinutes}
      />
   )

   return (
      <SuspenseWithBoundary fallback={fallBack}>
         {isLoadingAuth ? (
            <Skeleton
               sx={statusStyles.chip}
               height={26}
               width={115}
               variant="rectangular"
            />
         ) : isLoggedOut ? (
            fallBack
         ) : (
            <Content
               module={module}
               onShineAnimationComplete={onShineAnimationComplete}
            />
         )}
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
         estimatedModuleDurationMinutes={module.estimatedModuleDurationMinutes}
         percentProgress={moduleProgress?.percentageComplete}
      />
   )
}
