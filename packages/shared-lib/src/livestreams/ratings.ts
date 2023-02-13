import { EventRating, EventRatingAnswer } from "./livestreams"

/**
 * Given a livestream rating answer, calculates the rating that
 * will be used for the aggregated livestream stats averageRating
 *
 * If null is returned, the rating couldn't be calculated
 */
export function normalizeRating(
   ratingDoc: EventRating,
   answer: Partial<EventRatingAnswer>
): number | null {
   // no rating information
   if (ratingDoc?.noStars) {
      return null
   }

   if (ratingDoc?.isSentimentRating && answer?.rating) {
      // assign a 1-5 rating based on the sentiment(1-3)
      return answer.rating === 1 ? 1 : answer.rating === 2 ? 3 : 5
   }

   return answer?.rating ?? null
}
