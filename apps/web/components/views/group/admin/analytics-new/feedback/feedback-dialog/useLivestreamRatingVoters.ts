import { EventRatingAnswer } from "@careerfairy/shared-lib/livestreams"
import { collection, orderBy, query, where } from "firebase/firestore"
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
         ...(hasText
            ? [
                 where("message", "!=", ""), // filter out empty string message
                 orderBy("message", "desc"), // filter out undefined message
                 orderBy("rating", "desc"),
              ]
            : [orderBy("rating", "desc")])
      )
   )
}

export default useLivestreamRatingVoters
