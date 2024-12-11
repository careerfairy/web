import { useAppSelector } from "components/custom-hook/store"

export const useVisibleSteps = () =>
   useAppSelector((state) =>
      state.talentGuide.visibleSteps
         .map(
            (index) => state.talentGuide.moduleData?.content.moduleSteps[index]
         )
         .filter(Boolean)
   )

export const useCurrentStep = () =>
   useAppSelector(
      (state) =>
         state.talentGuide.moduleData?.content.moduleSteps[
            state.talentGuide.currentStepIndex
         ]
   )

export const useIsLastStep = () =>
   useAppSelector(
      (state) =>
         state.talentGuide.currentStepIndex ===
         state.talentGuide.moduleData?.content.moduleSteps.length - 1
   )

export const useProgress = () =>
   useAppSelector((state) => {
      if (!state.talentGuide.moduleData?.content.moduleSteps) return 0
      return (
         ((state.talentGuide.currentStepIndex + 1) /
            state.talentGuide.moduleData.content.moduleSteps.length) *
         100
      )
   })

export const useTalentGuideTitle = () =>
   useAppSelector((state) => state.talentGuide.moduleData?.content.moduleName)

export const useIsLoadingTalentGuide = () =>
   useAppSelector((state) => state.talentGuide.isLoadingTalentGuide)

export const useIsLoadingNextStep = () =>
   useAppSelector((state) => state.talentGuide.isLoadingNextStep)
