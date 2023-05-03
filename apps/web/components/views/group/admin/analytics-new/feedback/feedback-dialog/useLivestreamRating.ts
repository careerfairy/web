import { useFirestoreDocument } from "../../../../../../custom-hook/utils/useFirestoreDocument"
import { EventRating } from "@careerfairy/shared-lib/livestreams"

const useLivestreamRating = (livestreamId: string, ratingId: string) => {
   return useFirestoreDocument<EventRating>("livestreams", [
      livestreamId,
      "rating",
      ratingId,
   ])
}

export default useLivestreamRating
