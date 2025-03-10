import { removeDuplicateDocuments } from "../../BaseFirebaseRepository"
import { Group } from "../../groups"
import { LivestreamEvent } from "../../livestreams"
import { AdditionalUserRecommendationInfo, UserData } from "../../users"
import { Logger } from "../../utils/types"
import { sortDocumentByPopularity } from "../../utils/utils"
import { sortRankedByPoints } from "../utils"
import { ImplicitLivestreamRecommendationData } from "./ImplicitLivestreamRecommendationData"
import { RankedLivestreamEvent } from "./RankedLivestreamEvent"
import { RECOMMENDATION_POINTS } from "./constants"
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
      const sortedResults = sortRankedByPoints<RankedLivestreamEvent>(
         results.flat()
      )

      // Remove duplicates (be sure to remove duplicates before sorting)
      const deDupedEvents = removeDuplicateDocuments(sortedResults)

      if (this.debug) {
         this.log?.info("Metadata", {
            userMetaData: {
               userId: user?.id || "N/A",
               userUniversityCountryCode: user?.universityCountryCode || "N/A",
               userUniversityCode: user?.university?.code || "N/A",
               userFieldOfStudyId: user?.fieldOfStudy?.id || "N/A",
               userLevelOfStudyId: user?.levelOfStudy?.id || "N/A",
               userSpokenLanguages: user?.spokenLanguages || [],
               userCountriesOfInterest: user?.countriesOfInterest || [],
            },
            eventMetaData: deDupedEvents.map((e) => ({
               id: e.id,
               numPoints: e.points,
               targetCountries: e.getTargetCountries(),
               targetUniversities: e.getTargetUniversities(),
               targetFieldsOfStudy: e.getFieldOfStudyIds(),
               targetLevelOfStudies: e.getTargetLevelOfStudyIds(),
               language: e.getLanguage(),
               groupIds: e.getGroupIds(),
               companyTargetCountries: e.getCompanyTargetCountries(),
               companyTargetUniversities: e.getCompanyTargetUniversities(),
               companyTargetFieldsOfStudies:
                  e.getCompanyTargetFieldsOfStudies(),
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
            .sort(sortDocumentByPopularity)
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
      limit: number,
      implicitData?: ImplicitLivestreamRecommendationData,
      additionalUserData?: AdditionalUserRecommendationInfo,
      userFeaturedGroups?: { [groupId: string]: Group }
   ): RankedLivestreamEvent[] {
      console.log("🚀 ~ RecommendationServiceCore ~ userId:", userData.id)

      const userRecommendationBuilder = new UserBasedRecommendationsBuilder(
         limit,
         userData,
         new RankedLivestreamRepository(livestreams)
      )

      if (implicitData) {
         userRecommendationBuilder.setImplicitData(implicitData)
      }

      userRecommendationBuilder.setAdditionalData(additionalUserData)

      return userRecommendationBuilder
         .userUniversityCountry()
         .userUniversity()
         .userLevelsOfStudy()
         .userUniversityCompanyTargetCountry()
         .userCountriesOfInterest()
         .userCompanyTargetUniversity()
         .userCompanyTargetFieldsOfStudy()
         .userContentTopicTags()
         .userBusinessFunctionsTags()
         .userImplicitFollowedCompanies()
         .userImplicitInteractedEventsCompanyCountry()
         .userImplicitInteractedEventsCompanyIndustries()
         .userImplicitInteractedEventsCompanySize()
         .userImplicitInteractedEventsInterests()
         .userImplicitInteractedEventsLanguage()
         .userImplicitWatchedSparksCompanyCountry()
         .userImplicitWatchedSparksCompanyIndustries()
         .userImplicitWatchedSparksCompanySize()
         .userImplicitAppliedJobsCompanyCountry()
         .userImplicitAppliedJobsCompanyIndustries()
         .userImplicitAppliedJobsCompanySize()
         .userStudyBackground()
         .userLanguages()
         .get((rankedLivestream) => {
            return applyFeaturedGroupPoints(
               rankedLivestream,
               userFeaturedGroups
            )
         })
   }
}

export const applyFeaturedGroupPoints = (
   rankedLivestream: RankedLivestreamEvent,
   userFeaturedGroups?: { [groupId: string]: Group }
) => {
   const allFeaturedGroupIds = userFeaturedGroups
      ? Object.keys(userFeaturedGroups)
      : []

   if (
      allFeaturedGroupIds.find((id) =>
         rankedLivestream.getGroupIds()?.includes(id)
      )
   ) {
      const featuredGroupPoints =
         rankedLivestream.getPoints() *
         RECOMMENDATION_POINTS.FEATURED_GROUP_LIVESTREAM_POINTS_MULTIPLIER
      console.log(
         "🚀 live stream id, points, applied points: ",
         rankedLivestream.model.id,
         rankedLivestream.getPoints(),
         featuredGroupPoints
      )

      rankedLivestream.setPoints(featuredGroupPoints)
   } else {
      console.log(
         "🚀 live stream id, points, ignored: ",
         rankedLivestream.model.id,
         rankedLivestream.getPoints()
      )
   }
}
