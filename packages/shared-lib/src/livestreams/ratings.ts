import { round } from "../utils"
import { EventRating, EventRatingAnswer } from "./livestreams"
import { LiveStreamStats } from "./stats"

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

/**
 * Adds a new rating to an existing calculated average
 *
 * Rounded to 1 decimal place
 */
export function calculateNewAverage(
   existingStats: LiveStreamStats,
   ratingId: string,
   newValue: number
) {
   const existingNumOfRatings =
      existingStats.ratings?.[ratingId]?.numberOfRatings ?? 0
   const existingAvg = existingStats.ratings?.[ratingId]?.averageRating ?? 0

   const newNumRatings = existingNumOfRatings + 1
   const newAvg = existingAvg + (newValue - existingAvg) / newNumRatings

   return round(newAvg, 1)
}

/**
 * Calculates an average rating from all the multiple rating questions a
 * livestream has, useful to display a single rating for a livestream
 */
export function getGlobalRatingAverage(statDoc: LiveStreamStats) {
   if (!statDoc.ratings || Object.keys(statDoc.ratings).length === 0) return 0

   let avg = 0
   for (const rating in statDoc.ratings) {
      avg += statDoc.ratings[rating].averageRating
   }

   return avg / Object.keys(statDoc.ratings).length
}

export function getTotalNumberOfRatings(statDoc: LiveStreamStats): number {
   return Object.values(statDoc.ratings || {}).reduce(
      (total, rating) => total + rating.numberOfRatings,
      0
   )
}
