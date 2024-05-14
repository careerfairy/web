import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { livestreamService } from "data/firebase/LivestreamService"
import { DocumentReference } from "firebase/firestore"
import useSWRMutation from "swr/mutation"
import useSnackbarNotifications from "../../useSnackbarNotifications"

const getKey = (livestreamId: string, questionId: string) => {
   if (!questionId || !livestreamId) {
      return null
   }
   return `toggle-upvote-question-${livestreamId}-${questionId}`
}

/**
 * Custom hook for toggling the upvote on a specific live stream question.
 *
 * @param  livestreamId - The ID of the live stream.
 * @param  questionId - The ID of the question to toggle upvote.
 * @param  livestreamToken - The token for authenticating the live stream action.
 * @returns An object containing the mutation function to toggle upvote on a question and its related SWR mutation state.
 */
export const useToggleUpvoteLivestreamQuestion = (
   streamRef: DocumentReference<LivestreamEvent>,
   questionId: string,
   args: { email: string; uid: string; deprecatedSessionUuid?: string }
) => {
   const { errorNotification } = useSnackbarNotifications()

   const fetcher = () =>
      livestreamService.toggleUpvoteQuestion(streamRef, questionId, args)

   return useSWRMutation(getKey(streamRef.id, questionId), fetcher, {
      onError: (error, key) => {
         errorNotification(
            error,
            "Failed to toggle upvote on question in live stream",
            {
               key,
               questionId,
               streamRef,
            }
         )
      },
   })
}
