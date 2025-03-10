import { combineRankedDocuments } from "../../BaseFirebaseRepository"
import { Group } from "../../groups"
import { SparkStats } from "../../sparks/sparks"
import {
   AdditionalUserRecommendationInfo,
   StudyBackground,
   UserData,
} from "../../users/users"
import { Logger } from "../../utils/types"
import { sortRankedByPoints } from "../utils"
import { RankedSpark } from "./RankedSpark"
import { RankedSparkRepository } from "./service/RankedSparkRepository"
import { UserBasedRecommendationsBuilder } from "./service/UserBasedRecommendationsBuilder"

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
   setStudyBackgrounds(
      studyBackgrounds: StudyBackground[]
   ): IRecommendationSparksService
   setAdditionalUserInfo(
      additionalUserInfo: AdditionalUserRecommendationInfo
   ): IRecommendationSparksService
}

export default class RecommendationSparksServiceCore {
   constructor(
      protected log?: Logger | undefined,
      protected debug: boolean = true
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
      user?: UserData
   ) {
      // Combine the results of recommended sparks
      const combinedResults = combineRankedDocuments(results)

      // Sort the combined results by points
      const sortedRecommendedSparks =
         sortRankedByPoints<RankedSpark>(combinedResults)

      // Log metadata if debug mode is enabled
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

      // Return the top {limit} events
      const recommendedIds = sortedRecommendedSparks

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
    * Get recommendations based on the user's data
    */
   protected getRecommendedSparksBasedOnUserData(
      userData: UserData,
      sparks: SparkStats[],
      additionalUserInfo: AdditionalUserRecommendationInfo,
      limit: number,
      sparkGroups: { [sparkId: string]: Group }
   ): RankedSpark[] {
      const userRecommendationBuilder = new UserBasedRecommendationsBuilder(
         limit,
         userData,
         new RankedSparkRepository(sparks),
         additionalUserInfo
      )

      return userRecommendationBuilder
         .userCountriesOfInterest()
         .userUniversityCountry()
         .userUniversityCode()
         .userFieldOfStudy()
         .userStudyBackground()
         .get(sparkGroups, userData)
   }
}
