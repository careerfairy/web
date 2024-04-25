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
 * Custom hook to fetch a collection of livestream questions based on the specified type and limit.
 * @param livestreamId - The unique identifier for the livestream.
 * @param options - Configuration options including type and limit of questions.
 * @returns A collection of livestream questions.
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
