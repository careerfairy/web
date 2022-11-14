import { livestreamsRepo, userRepo } from "../api/repositories"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"

/**
 *  The function takes a user's ID and returns a list of recommended events
 * @param {string} userId - The user's ID
 * @param {number} limit - The number of recommended events to return
 * @returns {Promise<string[]>} - A list of recommended event Ids in order of relevance
 * */
export const recommendationEngine = async (
   userId: string,
   limit: number
): Promise<string[]> => {
   const userData = await userRepo.getUserDataById(userId)

   const recommendedEvents: LivestreamPresenter[][] = await Promise.all([
      // Fetch top {limit} recommended events based on the user's Metadata
      getRecommendedEventsBasedOnUserData({ userData, limit }),

      // TODO: Fetch top {limit} recommended events based on the user actions, eg. the events they have attended
   ])

   // TODO: Combine the results from the two queries above

   // TODO: Sort by points

   // TODO: Remove duplicates (be sure to remove duplicates before sorting)

   // TODO: Return the top {limit} events

   return recommendedEvents
      .flat()
      .map((event) => event.id)
      .slice(0, limit)
}

/**
 *  The function gets the user's recommended events based on their interests
 * */
const getRecommendedEventsBasedOnUserData = async ({
   userData,
   limit,
}: {
   userData: UserData
   limit: number
}): Promise<LivestreamPresenter[]> => {
   if (!userData) {
      return []
   }

   const arrayOfRecommendedEventsBasedOnUserData: LivestreamPresenter[][] =
      await Promise.all([
         // Fetch recommended events based on the user's interests
         livestreamsRepo.getRecommendEventsBasedOnUserInterests(
            userData.interestsIds,
            limit
         ),
         // TODO: Fetch recommended events based on the user's field of study
      ])

   // TODO: Combine the results from the two queries above and remove duplicates

   // TODO: Assign a score to each event based on the user's interests and field of study

   // TODO: Sort by points and return the top {limit} events

   return arrayOfRecommendedEventsBasedOnUserData.flat().slice(0, limit)
}
