import { removeDuplicateDocuments } from "../BaseFirebaseRepository"
import { LivestreamEvent } from "../livestreams"
import { UserData } from "../users"
import { sortLivestreamsByPopularity } from "../utils"
import { Logger } from "../utils/types"
import {
   RankedLivestreamEvent,
   sortRankedLivestreamEventByPoints,
} from "./RankedLivestreamEvent"
import { RankedLivestreamRepository } from "./services/RankedLivestreamRepository"
import { UserBasedRecommendationsBuilder } from "./services/UserBasedRecommendationsBuilder"

/**
 * The outputted IDs of recommendations for the given {@link IdToRecommend}
 */
type Recommendations = string[]

/**
 * The maximum number of recommendations
 * */
type MaxRecommendations = number

export interface IRecommendationService {
   getRecommendations(limit?: MaxRecommendations): Promise<Recommendations>
}

export default class RecommendationServiceCore {
   constructor(
      protected log?: Logger | undefined,
      protected debug: boolean = false
   ) {}

   /**
    * Sort, removes duplicates, and returns the top {limit} events
    *
    * The fallback events are used if there are not enough events to return
    * these are sorted by popularity
    */
   protected process(
      results: RankedLivestreamEvent[] | RankedLivestreamEvent[][],
      limit: number,
      fallBackLivestreams: LivestreamEvent[],
      user?: UserData
   ) {
      // Sort the results by points
      const sortedResults = sortRankedLivestreamEventByPoints(results.flat())

      // Remove duplicates (be sure to remove duplicates before sorting)
      const deDupedEvents = removeDuplicateDocuments(sortedResults)

      if (this.debug) {
         this.log?.info("Metadata", {
            userMetaData: {
               userId: user?.id || "N/A",
               userInterestIds: user?.interestsIds || [],
               userFieldOfStudyId: user?.fieldOfStudy?.id || "N/A",
               userCountriesOfInterest: user?.countriesOfInterest || [],
            },
            eventMetaData: deDupedEvents.map((e) => ({
               id: e.id,
               numPoints: e.points,
               fieldsOfStudyIds: e.getFieldOfStudyIds(),
               interestIds: e.getInterestIds(),
               companyCountries: e.getCompanyCountries(),
               companyIndustries: e.getCompanyIndustries(),
               companySizes: e.getCompanySizes(),
            })),
         })
      }

      // fill events if required
      const filledEvents = this.fillMissingEvents(
         deDupedEvents,
         limit,
         fallBackLivestreams
      )

      // Return the top {limit} events
      const recommendedIds = filledEvents
         .map((event) => event.id)
         .slice(0, limit)

      if (this.debug) {
         this.log?.info(
            `Recommended event IDs for user ${user?.id}: ${recommendedIds}`
         )
      }

      return recommendedIds
   }

   /**
    * Fill the rest of the events with the fallback events
    *
    * Useful when the user doesn't have enough metadata fields (user based recommendations will be empty)
    * also when generating the newsletter, for old accounts, we don't have enough data to generate recommendations
    * sorted by popularity
    */
   private fillMissingEvents(
      deDupedEvents: RankedLivestreamEvent[],
      limit: number,
      fallBackLivestreams: LivestreamEvent[]
   ) {
      let filledEvents = [...deDupedEvents]
      if (deDupedEvents.length < limit) {
         const fallbackEvents = fallBackLivestreams
            .sort(sortLivestreamsByPopularity)
            .map((event) => new RankedLivestreamEvent(event))

         filledEvents = filledEvents.concat(fallbackEvents)
         filledEvents = removeDuplicateDocuments(filledEvents)
         if (this.debug) {
            this.log?.info(
               `Required to fill missing events because user only had ${deDupedEvents.length} events.`
            )
         }
      }

      return filledEvents
   }

   /**
    * Get recommendations based on the user's data
    */
   protected getRecommendedEventsBasedOnUserData(
      userData: UserData,
      livestreams: LivestreamEvent[],
      limit: number
   ): RankedLivestreamEvent[] {
      const userRecommendationBuilder = new UserBasedRecommendationsBuilder(
         limit,
         userData,
         new RankedLivestreamRepository(livestreams)
      )

      return userRecommendationBuilder
         .userInterests()
         .userFieldsOfStudy()
         .userCountriesOfInterest()
         .get()
   }
}
