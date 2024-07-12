import { LivestreamGroupQuestionsMap } from "@careerfairy/shared-lib/livestreams"
import { FormikErrors } from "formik"

export const checkIfUserHasAnsweredAllLivestreamGroupQuestions = (
   livestreamGroupQuestionsWithUserAnswers: LivestreamGroupQuestionsMap
): boolean => {
   if (!livestreamGroupQuestionsWithUserAnswers) return true
   return Object.values(livestreamGroupQuestionsWithUserAnswers).reduce(
      (acc, groupDataWithQuestions) => {
         return (
            acc &&
            Object.values(groupDataWithQuestions.questions).every(
               (question) => question.options[question?.selectedOptionId]?.id
            )
         )
      },
      true
   )
}

export const validate = (
   livestreamGroupQuestionsWithUserAnswers: LivestreamGroupQuestionsMap
): FormikErrors<LivestreamGroupQuestionsMap> => {
   return Object.values(livestreamGroupQuestionsWithUserAnswers).reduce<
      FormikErrors<LivestreamGroupQuestionsMap>
   >((acc, groupDataWithQuestions) => {
      Object.values(groupDataWithQuestions.questions).forEach((question) => {
         const isValidAnswer = question.options[question?.selectedOptionId]?.id
         if (!isValidAnswer) {
            if (!acc[groupDataWithQuestions.groupId]) {
               acc[groupDataWithQuestions.groupId] = {}
            }
            if (!acc[groupDataWithQuestions.groupId].questions) {
               acc[groupDataWithQuestions.groupId].questions = {}
            }
            if (!acc[groupDataWithQuestions.groupId].questions[question.id]) {
               acc[groupDataWithQuestions.groupId].questions[question.id] = {}
            }
            return (acc[groupDataWithQuestions.groupId].questions[
               question.id
            ].selectedOptionId = "Please select an answer")
         }
         return acc
      })
      return acc
   }, {})
}
