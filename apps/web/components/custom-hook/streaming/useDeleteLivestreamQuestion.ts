import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import { DocumentReference } from "firebase/firestore"
import useSWRMutation from "swr/mutation"
import useSnackbarNotifications from "../useSnackbarNotifications"

const getKey = (livestreamId: string, questionId: string) => {
   if (!questionId || !livestreamId) {
      return null
   }
   return `delete-question-${livestreamId}-${questionId}`
}

/**
 * Custom hook for deleting a specific livestream question.
 *
 * @param  livestreamId - The ID of the livestream.
 * @param  questionId - The ID of the question to delete.
 * @param  livestreamToken - The token for authenticating the livestream action.
 * @returns An object containing the mutation function to delete a question and its related SWR mutation state.
 */
export const useDeleteLivestreamQuestion = (
   streamRef: DocumentReference<LivestreamEvent>,
   questionId: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = () => livestreamService.deleteQuestion(streamRef, questionId)

   return useSWRMutation(getKey(streamRef.id, questionId), fetcher, {
      onError: (error, key) => {
         errorNotification(error, "Failed to delete question from livestream", {
            key,
            questionId,
            streamRef,
         })
      },
   })
}
