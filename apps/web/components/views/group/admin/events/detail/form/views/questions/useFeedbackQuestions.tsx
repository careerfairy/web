import { EventRating } from "@careerfairy/shared-lib/livestreams"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { mapRatingToFeedbackQuestions } from "./commons"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

export const useFeedbackQuestions = (
   livestreamId: string,
   targetCollection: string
) => {
   const { data: ratings, status } = useFirestoreCollection<EventRating>(
      query(
         collection(FirestoreInstance, targetCollection, livestreamId, "rating")
      ),
      reactFireOptions
   )

   const feedbackQuestions = ratings.map(mapRatingToFeedbackQuestions)

   return { feedbackQuestions, status }
}
