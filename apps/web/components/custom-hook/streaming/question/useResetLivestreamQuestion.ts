import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"
import useSnackbarNotifications from "../../useSnackbarNotifications"

const getKey = (livestreamId: string, questionId: string) => {
   if (!questionId || !livestreamId) {
      return null
   }
   return `reset-question-${livestreamId}-${questionId}`
}

/**
 * Custom hook for resetting a specific livestream question.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  questionId - The ID of the question to reset.
 * @param  livestreamToken - The token for authenticating the livestream action.
 * @returns An object containing the mutation function to reset a question and its related SWR mutation state.
 */
export const useResetLivestreamQuestion = (
   livestreamId: string,
   questionId: string,
   livestreamToken: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = () =>
      livestreamService.resetQuestion({
         livestreamId,
         livestreamToken,
         questionId,
      })

   return useSWRMutation(getKey(livestreamId, questionId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to reset question in livestream", {
            key,
            questionId,
         })
      },
   })
}
