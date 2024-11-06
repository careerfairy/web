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
