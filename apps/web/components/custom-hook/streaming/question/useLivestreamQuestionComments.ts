import { LivestreamQuestionComment } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, orderBy, query } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { useFirestoreCollection } from "../../utils/useFirestoreCollection"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

/**
 * Custom hook to fetch a collection of livestream question comments.
 * @param livestreamId - The unique identifier for the livestream.
 * @param questionId - The unique identifier for the question.
 * @returns A collection of live stream question comments.
 */
export const useLivestreamQuestionComments = (
   livestreamId: string,
   questionId: string
) => {
   return useFirestoreCollection<LivestreamQuestionComment>(
      query(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "questions",
            questionId,
            "comments"
         ),
         orderBy("timestamp", "asc")
      ),
      reactFireOptions
   )
}
