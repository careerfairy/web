import {
   combineRankedDocuments,
   removeDuplicateDocuments,
} from "../../BaseFirebaseRepository"
import { SparkStats } from "../../sparks/sparks"
import { UserData } from "../../users/users"
import { sortDocumentByPopularity } from "../../utils"
import { Logger } from "../../utils/types"
import { RankedSpark, sortRankedSparksByPoints } from "./RankedSpark"
import { RankedSparkRepository } from "./serivce/RankedSparkRepository"
import { UserBasedRecommendationsBuilder } from "./serivce/UserBasedRecommendationsBuilder"

/**
 * The outputted IDs of recommendations for the given {@link IdToRecommend}
 */
type Recommendations = string[]

/**
 * The maximum number of recommendations
 * */
type MaxRecommendations = number

export interface IRecommendationSparksService {
   getRecommendations(limit?: MaxRecommendations): Promise<Recommendations>
}

export default class RecommendationSparksServiceCore {
   constructor(
      protected log?: Logger | undefined,
      protected debug: boolean = false
   ) {}

   /**
    * Combine recommendation results, sort, and returns the top {limit} sparks
    *
    * The fallback sparks are used if there are not enough sparks to return
    * these are sorted by popularity
    */
   protected process(
      results: RankedSpark[] | RankedSpark[][],
      limit: number,
      fallBackSparks: SparkStats[],
      user?: UserData
   ) {
      // Combine the results of recommended sparks
      const combinedResults = combineRankedDocuments(results)

      // Sort the combined results by points
      const sortedRecommendedSparks = sortRankedSparksByPoints(combinedResults)

      if (this.debug) {
         this.log?.info("Metadata", {
            userMetaData: {
               userId: user?.id || "N/A",
               userCountriesOfInterest: user?.countriesOfInterest || [],
               userUniversityCountryCode: user?.universityCountryCode || "N/A",
               userUniversityCode: user?.university.code || "N/A",
               userFieldOfStudyId: user?.fieldOfStudy?.id || "N/A",
            },
            sparkMetaData: sortedRecommendedSparks.map((e) => ({
               id: e.id,
               numPoints: e.points,
               companyCountry: e.getCompanyCountryId(),
               companyIndustries: e.getCompanyIndustryIds(),
               companySizes: e.getCompanySize(),
               category: e.getCategoryId(),
            })),
         })
      }

      // fill sparks if required
      const filledSparks = this.fillMissingSparks(
         sortedRecommendedSparks,
         limit,
         fallBackSparks
      )

      // Return the top {limit} events
      const recommendedIds = filledSparks
         .map((event) => event.id)
         .slice(0, limit)

      if (this.debug) {
         this.log?.info(
            `Recommended spark IDs for user ${user?.id}: ${recommendedIds}`
         )
      }

      return recommendedIds
   }

   /**
    * Fill the rest of the sparks with the fallback sparks
    *
    * Useful when the user doesn't have enough metadata fields (user based recommendations will be empty)
    * also when generating the newsletter, for old accounts, we don't have enough data to generate recommendations
    * sorted by popularity
    */
   private fillMissingSparks(
      deDupedSparks: RankedSpark[],
      limit: number,
      fallBackSparks: SparkStats[]
   ) {
      let filledSparks = [...deDupedSparks]
      if (deDupedSparks.length < limit) {
         const mappedFallBackSparks = fallBackSparks
            .sort(sortDocumentByPopularity)
            .map((spark) => new RankedSpark(spark))

         filledSparks = filledSparks.concat(mappedFallBackSparks)
         filledSparks = removeDuplicateDocuments(filledSparks)
         if (this.debug) {
            this.log?.info(
               `Required to fill missing events because user only had ${deDupedSparks.length} sparks.`
            )
         }
      }

      return filledSparks
   }

   /**
    * Get recommendations based on the user's data
    */
   protected getRecommendedSparksBasedOnUserData(
      userData: UserData,
      sparks: SparkStats[],
      limit: number
   ): RankedSpark[] {
      const userRecommendationBuilder = new UserBasedRecommendationsBuilder(
         limit,
         userData,
         new RankedSparkRepository(sparks)
      )

      return userRecommendationBuilder
         .userCountriesOfInterest()
         .userUniversityCountry()
         .userUniversityCode()
         .userFieldOfStudy()
         .get()
   }
}
