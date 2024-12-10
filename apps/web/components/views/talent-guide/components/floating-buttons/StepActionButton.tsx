import {
   useCurrentStep,
   useIsLastStep,
} from "store/selectors/talentGuideSelectors"
import { FinishModuleButton } from "./FinishModuleButton"
import { NextButton } from "./NextButton"
import { QuizButton } from "./QuizButton"

export const completedQuizIds = ["abc", "def", "ghi"] // TODO: store and get from firestore

export const StepActionButton = () => {
   const currentStep = useCurrentStep()
   const isLastStep = useIsLastStep()

   if (!currentStep) return null

   if (currentStep.content.__typename === "Quiz") {
      const quiz = currentStep.content

      const quizIsCompleted = completedQuizIds.includes(quiz.id) // TODO: replace with hook to check if quiz is completed in firestore

      if (quizIsCompleted && isLastStep) return <FinishModuleButton />

      if (quizIsCompleted) return <NextButton />

      return <QuizButton quiz={quiz} />
   }

   if (isLastStep) return <FinishModuleButton />

   return <NextButton />
}
