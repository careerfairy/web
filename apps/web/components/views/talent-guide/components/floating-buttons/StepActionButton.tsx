import { QUIZ_STATE } from "@careerfairy/shared-lib/talent-guide/types"
import {
   useCurrentQuiz,
   useCurrentStep,
   useIsLastStep,
   useQuizState,
} from "store/selectors/talentGuideSelectors"
import { FinishModuleButton } from "./FinishModuleButton"
import { NextButton } from "./NextButton"
import { QuizButton } from "./QuizButton"

export const completedQuizIds = ["abc", "def", "ghi"] // TODO: store and get from firestore

export const StepActionButton = () => {
   const currentStep = useCurrentStep()
   const currentQuiz = useCurrentQuiz()
   const quizState = useQuizState(currentQuiz?.id)
   const isLastStep = useIsLastStep()

   if (!currentStep) return null

   if (currentQuiz) {
      const quizIsAttempted = quizState.state !== QUIZ_STATE.NOT_ATTEMPTED

      if (quizIsAttempted && isLastStep) return <FinishModuleButton />

      if (quizIsAttempted) return <NextButton />

      return <QuizButton quiz={currentQuiz} quizStatus={quizState} />
   }

   if (isLastStep) return <FinishModuleButton />

   return <NextButton />
}
