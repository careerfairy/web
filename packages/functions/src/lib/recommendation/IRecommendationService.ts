import { removeDuplicateDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { RankedLivestreamRepository } from "./services/RankedLivestreamRepository"
import { UserBasedRecommendationsBuilder } from "./services/UserBasedRecommendationsBuilder"
import {
   RankedLivestreamEvent,
   sortRankedLivestreamEventByPoints,
} from "./util"

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
   constructor(protected log: Logger, protected debug: boolean) {}

   /**
    * Sort, removes duplicates, and returns the top {limit} events
    */
   protected process(
      results: RankedLivestreamEvent[] | RankedLivestreamEvent[][],
      limit: number,
      user?: UserData
   ) {
      // Sort the results by points
      const sortedResults = sortRankedLivestreamEventByPoints(results.flat())

      // Remove duplicates (be sure to remove duplicates before sorting)
      const deDupedEvents = removeDuplicateDocuments(sortedResults)

      if (this.debug) {
         this.log.info("Metadata", {
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

      // Return the top {limit} events
      const recommendedIds = deDupedEvents
         .map((event) => event.id)
         .slice(0, limit)

      if (this.debug) {
         this.log.info(
            `Recommended event IDs for user ${user?.id}: ${recommendedIds}`
         )
      }

      return recommendedIds
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
         this.log,
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
