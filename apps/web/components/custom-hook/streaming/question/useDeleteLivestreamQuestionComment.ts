import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import { DocumentReference } from "firebase/firestore"
import useSWRMutation from "swr/mutation"
import useSnackbarNotifications from "../../useSnackbarNotifications"

const getKey = (
   livestreamId: string,
   questionId: string,
   commentId: string
) => {
   if (!questionId || !livestreamId || !commentId) {
      return null
   }
   return `delete-comment-${livestreamId}-${questionId}-${commentId}`
}

/**
 * Custom hook for deleting a specific comment on a livestream question.
 *
 * @param  streamRef - The Firestore reference to the livestream.
 * @param  questionId - The ID of the question.
 * @param  commentId - The ID of the comment to delete.
 * @returns An object containing the mutation function to delete a comment and its related SWR mutation state.
 */
export const useDeleteLivestreamQuestionComment = (
   streamRef: DocumentReference<LivestreamEvent>,
   questionId: string,
   commentId: string
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = () =>
      livestreamService.deleteQuestionComment(streamRef, questionId, commentId)

   return useSWRMutation(getKey(streamRef.id, questionId, commentId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to delete comment from question in livestream",
            {
               key,
               questionId,
               commentId,
               streamRef,
            }
         )
      },
   })
}
