import { Skeleton } from "@mui/material"
import { useModuleProgress } from "components/custom-hook/talent-guide/useModuleProgress"
import { TalentGuideModule } from "data/hygraph/types"
import { useAuth } from "HOCs/AuthProvider"
import { ModuleCompletedChip } from "./ModuleCompletedChip"
import { ModuleInfoChip } from "./ModuleInfoChip"
import { statusStyles } from "./styles"

type Props = {
   module: TalentGuideModule
   onShineAnimationComplete?: () => void
}

const SkeletonStatus = () => {
   return (
      <Skeleton
         sx={statusStyles.chip}
         height={25.98}
         width={115}
         variant="rectangular"
      />
   )
}

export const Status = ({ module, onShineAnimationComplete }: Props) => {
   const { isLoggedOut, isLoadingAuth } = useAuth()

   if (isLoadingAuth) {
      return <SkeletonStatus />
   }

   if (isLoggedOut) {
      return (
         <ModuleInfoChip
            moduleLevel={module.level}
            estimatedModuleDurationMinutes={
               module.estimatedModuleDurationMinutes
            }
         />
      )
   }

   return (
      <Content
         module={module}
         onShineAnimationComplete={onShineAnimationComplete}
      />
   )
}

const Content = ({ module, onShineAnimationComplete }: Props) => {
   const { moduleProgress, loading: isLoadingProgress } = useModuleProgress(
      module.id
   )

   if (isLoadingProgress) {
      return <SkeletonStatus />
   }

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
