import { livestreamService } from "data/firebase/LivestreamService"
import useSWRMutation from "swr/mutation"
import useSnackbarNotifications from "../../useSnackbarNotifications"

const getKey = (livestreamId: string, questionId: string) => {
   if (!questionId || !livestreamId) {
      return null
   }
   return `done-question-${livestreamId}-${questionId}`
}

/**
 * Custom hook for marking a specific livestream question as done.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  questionId - The ID of the question to mark as done.
 * @param  livestreamToken - The token for authenticating the livestream action.
 * @returns An object containing the mutation function to mark a question as done and its related SWR mutation state.
 */
export const useMarkQuestionAsDone = (
   livestreamId: string,
   questionId: string,
   livestreamToken: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = () =>
      livestreamService.markQuestionAsDone({
         livestreamId,
         livestreamToken,
         questionId,
      })

   return useSWRMutation(getKey(livestreamId, questionId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to mark question as done in livestream",
            {
               key,
               questionId,
            }
         )
      },
   })
}
