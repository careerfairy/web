import { QUIZ_STATE } from "@careerfairy/shared-lib/talent-guide/types"
import { useModuleProgress } from "components/custom-hook/talent-guide/useModuleProgress"
import {
   useCurrentQuiz,
   useCurrentStep,
   useIsLastStep,
   useModuleId,
   useQuizState,
} from "store/selectors/talentGuideSelectors"
import { FinishLevelButton } from "./FinishLevelButton"
import { NextButton } from "./NextButton"
import { QuizButton } from "./QuizButton"
import { RestartLevelButton } from "./RestartLevelButton"

export const StepActionButton = () => {
   const currentStep = useCurrentStep()
   const currentQuiz = useCurrentQuiz()
   const quizState = useQuizState(currentQuiz?.id)
   const isLastStep = useIsLastStep()
   const moduleId = useModuleId()
   const { moduleProgress } = useModuleProgress(moduleId)
   const isModuleCompleted = Boolean(moduleProgress?.completedAt)

   if (!currentStep) return null

   // Show restart button if module is completed
   if (isModuleCompleted) {
      return <RestartLevelButton />
   }

   if (currentQuiz) {
      const quizIsAttempted = quizState.state !== QUIZ_STATE.NOT_ATTEMPTED

      if (quizIsAttempted && isLastStep) return <FinishLevelButton />

      if (quizIsAttempted) return <NextButton />

      return <QuizButton quiz={currentQuiz} quizStatus={quizState} />
   }

   if (isLastStep) return <FinishLevelButton />

   return <NextButton />
}
