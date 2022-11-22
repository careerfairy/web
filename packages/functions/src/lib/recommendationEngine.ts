import {
   livestreamsRepo,
   recommendationRepo,
   userRepo,
} from "../api/repositories"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { removeDuplicateDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

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

   const recommendedEvents: LivestreamEvent[][] = await Promise.all([
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
}): Promise<LivestreamEvent[]> => {
   if (!userData) {
      return []
   }

   try {
      const arrayOfRecommendedEventsBasedOnUserData: LivestreamEvent[][] =
         await Promise.all([
            // Fetch recommended events based on the user's interests
            recommendationRepo.getRecommendEventsBasedOnUserInterests(
               userData,
               limit
            ),
            recommendationRepo.getRecommendEventsBasedOnUserFieldOfStudy(
               userData,
               limit
            ),
         ])

      const [_, fieldOfStudyEvents] = arrayOfRecommendedEventsBasedOnUserData

      console.log("-> USER FIELD OF STUDY", userData.fieldOfStudy)
      console.log(
         "targetFieldsOfStudy OF EVENTS",
         fieldOfStudyEvents?.map((event) => event.targetFieldsOfStudy)
      )

      // Combine the results from the two queries above and remove duplicates
      const results = removeDuplicateDocuments(
         arrayOfRecommendedEventsBasedOnUserData.filter(Boolean).flat()
      )
      console.log("-> num results", results.length)

      const livestreamRanker = new LivestreamRanker(results, userData)

      return livestreamRanker.getTopEventsBasedOnUserFieldOfStudy(10)
   } catch (e) {
      console.log("-> ERROR getRecommendedEventsBasedOnUserData", e)
      throw e
   }
}

class RankedLivestreamEvent {
   public points: number
   constructor(public model: LivestreamEvent) {
      this.model = model
   }

   static create(livestream: LivestreamEvent) {
      return new RankedLivestreamEvent(livestream)
   }

   addPoints(points: number) {
      this.points += points
   }

   removePoints(points: number) {
      this.points -= points
   }

   getPoints() {
      return this.points
   }
}

class LivestreamRanker {
   private readonly rankedLivestreamEvents: RankedLivestreamEvent[]
   private readonly user: UserData
   private readonly pointsPerInterestMatch = 1
   private readonly pointsPerFieldOfStudyMatch = 1

   constructor(livestreams: LivestreamEvent[], user: UserData) {
      this.rankedLivestreamEvents = livestreams.map(
         RankedLivestreamEvent.create
      )
      this.user = user
   }

   public getTopEventsBasedOnUserInterests(
      limit: number
   ): RankedLivestreamEvent[] {
      const events = this.rankedLivestreamEvents.map((livestream) => {
         const numInterestsMatched = livestream.model.interestsIds.filter(
            (interest) => this.user.interestsIds.includes(interest)
         ).length

         livestream.addPoints(numInterestsMatched * this.pointsPerInterestMatch)

         return livestream
      })

      return LivestreamRanker.sortRankedLivestreamEventByPoints(events).slice(
         0,
         limit
      )
   }

   public getTopEventsBasedOnUserFieldOfStudy(
      limit: 10
   ): RankedLivestreamEvent[] {
      const events = this.rankedLivestreamEvents.map((rankedLivestream) => {
         const isFieldOfStudyMatched =
            rankedLivestream.model.targetFieldsOfStudy.find(
               (fieldOfStudy) => fieldOfStudy.id === this.user.fieldOfStudy.id
            )

         if (isFieldOfStudyMatched) {
            rankedLivestream.addPoints(this.pointsPerFieldOfStudyMatch)
         }

         return rankedLivestream
      })

      return LivestreamRanker.sortRankedLivestreamEventByPoints(events).slice(
         0,
         limit
      )
   }

   static sortRankedLivestreamEventByPoints(
      rankedLivestreamEvents: RankedLivestreamEvent[]
   ) {
      return [...rankedLivestreamEvents].sort(
         (a, b) => b.getPoints() - a.getPoints()
      )
   }
}
