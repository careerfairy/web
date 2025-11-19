import { EventRatingAnswer } from "@careerfairy/shared-lib/livestreams"
import { collection, orderBy, query } from "firebase/firestore"
import { FirestoreInstance } from "../../../../../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../../../../../../custom-hook/utils/useFirestoreCollection"

const useLivestreamRatingVoters = (
   livestreamId: string,
   ratingId: string,
   hasText?: boolean
) => {
   return useFirestoreCollection<EventRatingAnswer>(
      query(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "rating",
            ratingId,
            "voters"
         ),
         orderBy("rating", "desc"),
         ...(hasText ? [orderBy("message", "desc")] : []) // if there is text, secondary sort by text as well
      )
   )
}

export default useLivestreamRatingVoters
