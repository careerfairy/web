import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import { DocumentReference } from "firebase/firestore"
import useSWRMutation from "swr/mutation"
import useSnackbarNotifications from "../../useSnackbarNotifications"

const getKey = (livestreamPath: string, questionId: string) => {
   if (!questionId || !livestreamPath) {
      return null
   }
   return `delete-question-${livestreamPath}/questions/${questionId}`
}

/**
 * Custom hook for deleting a specific livestream question or breakout-room question.
 * @param  streamRef - The reference to the livestream.
 * @param  questionId - The ID of the question to delete.
 * @returns An object containing the mutation function to delete a question and its related SWR mutation state.
 */
export const useDeleteLivestreamQuestion = (
   streamRef: DocumentReference<LivestreamEvent>,
   questionId: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = () => livestreamService.deleteQuestion(streamRef, questionId)

   return useSWRMutation(getKey(streamRef.path, questionId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to delete question from live stream",
            {
               key,
               questionId,
               streamRef,
            }
         )
      },
   })
}
