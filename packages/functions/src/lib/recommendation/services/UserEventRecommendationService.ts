import functions = require("firebase-functions")
import { removeDuplicateDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"

import RecommendationServiceCore, {
   IRecommendationService,
} from "../IRecommendationService"
import {
   handlePromisesAllSettled,
   RankedLivestreamEvent,
   sortRankedLivestreamEventByPoints,
} from "../util"
import { RankedLivestreamRepository } from "./RankedLivestreamRepository"
import { UserBasedRecommendationsBuilder } from "./UserBasedRecommendationsBuilder"
import { LivestreamBasedRecommendationsBuilder } from "./LivestreamBasedRecommendationsBuilder"
import { IRecommendationDataFetcher } from "./DataFetcherRecommendations"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

const serviceName = "user_event_recommendation_service"

export default class UserEventRecommendationService
   extends RecommendationServiceCore
   implements IRecommendationService
{
   constructor(
      private readonly user: UserData,
      private readonly futureLivestreams: LivestreamEvent[],
      private readonly pastLivestreams: LivestreamEvent[]
   ) {
      super(functions.logger)
   }

   async getRecommendations(limit = 10): Promise<string[]> {
      const promises: Promise<RankedLivestreamEvent[]>[] = []

      if (this.user) {
         // Fetch top {limit} recommended events based on the user's Metadata
         promises.push(this.getRecommendedEventsBasedOnUserData(this.user, 10))

         // Fetch top {limit} recommended events based on the user actions, e.g. the events they have attended
         promises.push(this.getRecommendedEventsBasedOnUserActions(10))
      }

      // Await all promises
      const recommendedEvents = await handlePromisesAllSettled(
         promises,
         this.log.error
      )

      // Sort the results by points
      const sortedResults = sortRankedLivestreamEventByPoints(
         recommendedEvents.flat()
      )

      // Remove duplicates (be sure to remove duplicates before sorting)
      const deDupedEvents = removeDuplicateDocuments(sortedResults)

      // Log some debug info
      this.log.info("Metadata", {
         userMetaData: {
            userId: this.user?.id || "N/A",
            userInterestIds: this.user?.interestsIds || [],
            userFieldOfStudyId: this.user?.fieldOfStudy?.id || "N/A",
            userCountriesOfInterest: this.user?.countriesOfInterest || [],
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

      // Return the top {limit} events
      const recommendedIds = deDupedEvents
         .map((event) => event.id)
         .slice(0, limit)

      this.log.info(
         `Recommended event IDs for user ${this.user?.id}: ${recommendedIds}`,
         {
            serviceName: serviceName,
         }
      )

      return recommendedIds
   }

   private async getRecommendedEventsBasedOnUserData(
      userData: UserData,
      limit: number
   ): Promise<RankedLivestreamEvent[]> {
      const userRecommendationBuilder = new UserBasedRecommendationsBuilder(
         this.log,
         limit,
         userData,
         new RankedLivestreamRepository(this.futureLivestreams)
      )

      return userRecommendationBuilder
         .userInterests()
         .userFieldsOfStudy()
         .userCountriesOfInterest()
         .get()
   }

   private async getRecommendedEventsBasedOnUserActions(
      limit: number
   ): Promise<RankedLivestreamEvent[]> {
      const promises: Promise<RankedLivestreamEvent[]>[] = [
         // Get events based on the user's previously attended events
         this.getRecommendedEventsBasedOnPreviousWatchedEvents(limit),
      ]

      // Await all promises
      const arrayOfRecommendedEventsBasedOnUserActions =
         await handlePromisesAllSettled(promises, this.log.error)

      // sort the results by points
      const sortedResults = sortRankedLivestreamEventByPoints(
         arrayOfRecommendedEventsBasedOnUserActions.flat()
      )

      // Combine the results from the two queries above and remove duplicates
      return removeDuplicateDocuments(sortedResults)
   }

   private async getRecommendedEventsBasedOnPreviousWatchedEvents(
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      const livestreamBasedRecommendations =
         new LivestreamBasedRecommendationsBuilder(
            this.log,
            limit,
            this.pastLivestreams,
            new RankedLivestreamRepository(this.futureLivestreams)
         )

      return livestreamBasedRecommendations
         .mostCommonInterests()
         .mostCommonFieldsOfStudy()
         .mostCommonCountries()
         .mostCommonIndustries()
         .mostCommonCompanySizes()
         .get()
   }

   static async create(
      dataFetcher: IRecommendationDataFetcher
   ): Promise<IRecommendationService> {
      const [user, futureLivestreams, pastLivestreams] = await Promise.all([
         dataFetcher.getUser(),
         dataFetcher.getFutureLivestreams(),
         dataFetcher.getPastLivestreams(),
      ])

      return new UserEventRecommendationService(
         user,
         futureLivestreams,
         pastLivestreams
      )
   }
}
