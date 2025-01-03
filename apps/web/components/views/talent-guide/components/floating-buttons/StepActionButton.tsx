import { QUIZ_STATE } from "@careerfairy/shared-lib/talent-guide/types"
import { useModuleProgress } from "components/custom-hook/talent-guide/useModuleProgress"
import {
   useCurrentQuiz,
   useCurrentStep,
   useIsLastStep,
   useModuleId,
   useQuizState,
} from "store/selectors/talentGuideSelectors"
import { FinishModuleButton } from "./FinishModuleButton"
import { NextButton } from "./NextButton"
import { QuizButton } from "./QuizButton"
import { RestartModuleButton } from "./RestartModuleButton"

export const completedQuizIds = ["abc", "def", "ghi"] // TODO: store and get from firestore

export const StepActionButton = () => {
   const currentStep = useCurrentStep()
   const currentQuiz = useCurrentQuiz()
   const quizState = useQuizState(currentQuiz?.id)
   const isLastStep = useIsLastStep()
   const moduleId = useModuleId()
   const moduleProgress = useModuleProgress(moduleId)
   const isModuleCompleted = Boolean(moduleProgress?.completedAt)

   if (!currentStep) return null

   // Show restart button if module is completed
   if (isModuleCompleted) {
      return <RestartModuleButton />
   }

   if (currentQuiz) {
      const quizIsAttempted = quizState.state !== QUIZ_STATE.NOT_ATTEMPTED

      if (quizIsAttempted && isLastStep) return <FinishModuleButton />

      if (quizIsAttempted) return <NextButton />

      return <QuizButton quiz={currentQuiz} quizStatus={quizState} />
   }

   if (isLastStep) return <FinishModuleButton />

   return <NextButton />
}
