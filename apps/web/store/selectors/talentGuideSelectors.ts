import { useAppSelector } from "components/custom-hook/store"
import { RootState } from "store"

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

export const getCurrentQuiz = (state: RootState) => {
   const currentStep =
      state.talentGuide.moduleData?.content.moduleSteps[
         state.talentGuide.currentStepIndex
      ]
   if (!currentStep) return null
   if (currentStep.content.__typename !== "Quiz") return null
   return currentStep.content
}

/**
 * Hook to get current quiz content from talent guide state
 */
export const useCurrentQuiz = () => useAppSelector(getCurrentQuiz)

/**
 * Hook to get quiz state from talent guide state
 */
export const useQuizState = (quizId: string) =>
   useAppSelector((state) => state.talentGuide.quizStatuses[quizId] || null)

export const useShowEndOfModuleExperience = () =>
   useAppSelector((state) => state.talentGuide.showEndOfModuleExperience)

export const useTalentGuideState = () =>
   useAppSelector((state) => state.talentGuide)

export const useModuleData = () =>
   useAppSelector((state) => state.talentGuide.moduleData)
