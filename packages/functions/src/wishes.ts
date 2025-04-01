import functions = require("firebase-functions")
import { Rating, Wish } from "@careerfairy/shared-lib/wishes"
import { onDocumentWritten } from "firebase-functions/firestore"
import { FieldValue, firestore } from "./api/firestoreAdmin"

// Listen for changes in all documents in the 'users' collection
const maxNumberOfUpvoterUids = 50
export const onUserRateWish = onDocumentWritten(
   "wishes/{wishId}/ratings/{userId}",
   async (event) => {
      const document = event.data?.after.exists
         ? (event.data?.after.data() as Rating)
         : null
      const oldDocument = event.data?.before.data() as Rating
      const userId = event.data?.after.id
      const prevRatingType = oldDocument?.type || null
      const currentRatingType = document?.type || null
      const wishRef = firestore.collection("wishes").doc(event.params.wishId)
      let wishUpdateData: Partial<Wish> = {}
      // if the rating hasn't changed, do nothing
      if (prevRatingType === currentRatingType) return null
      // run transaction to update the wish
      return firestore.runTransaction(async (transaction) => {
         const wish = await transaction.get(wishRef)
         if (!wish.exists) return
         const wishData = wish.data() as Wish

         if (currentRatingType === "upvote") {
            // add the user to the list of recent upvoters
            // also make sure that the list of recent upvoters doesn't exceed the max number
            const upvoterUids = wishData.uidsOfRecentUpvoters || []
            const limitedUpvoterUids = upvoterUids.splice(
               -maxNumberOfUpvoterUids - 1
            )
            wishUpdateData = {
               uidsOfRecentUpvoters: FieldValue.arrayUnion(
                  ...limitedUpvoterUids,
                  userId
               ) as unknown as string[],
               numberOfUpvotes: FieldValue.increment(1),
            }
         }
         if (prevRatingType === "downvote") {
            wishUpdateData.numberOfDownvotes = FieldValue.increment(-1)
         }
         if (prevRatingType === "upvote") {
            wishUpdateData.numberOfUpvotes = FieldValue.increment(-1)
         }
         // remove user uid from array of upvoterUids
         // if the user has downvoted the wish
         // or if the user has unrated the wish
         // or the user rating has been deleted
         if (
            currentRatingType === "downvote" ||
            currentRatingType === null ||
            document === null
         ) {
            if (currentRatingType === "downvote") {
               wishUpdateData.numberOfDownvotes = FieldValue.increment(1)
            }
            wishUpdateData.uidsOfRecentUpvoters = FieldValue.arrayRemove(
               userId
            ) as unknown as string[]
         }
         // update the wish
         if (wishUpdateData) {
            functions.logger.info("updated with with data:", wishUpdateData)
            transaction.update(wishRef, wishUpdateData)
         }
      })
   }
)
