import functions = require("firebase-functions")
import { removeDuplicateDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import RecommendationServiceCore, {
   IRecommendationService,
} from "@careerfairy/shared-lib/recommendation/IRecommendationService"

import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   handlePromisesAllSettled,
   RankedLivestreamEvent,
   sortRankedLivestreamEventByPoints,
} from "@careerfairy/shared-lib/recommendation/RankedLivestreamEvent"
import { LivestreamBasedRecommendationsBuilder } from "./services/LivestreamBasedRecommendationsBuilder"
import { IRecommendationDataFetcher } from "./services/DataFetcherRecommendations"
import { RankedLivestreamRepository } from "@careerfairy/shared-lib/recommendation/services/RankedLivestreamRepository"

/**
 * Best livestreams for a user based on their Metadata
 * and recent past events
 */
export default class UserEventRecommendationService
   extends RecommendationServiceCore
   implements IRecommendationService
{
   constructor(
      private readonly user: UserData,
      private readonly futureLivestreams: LivestreamEvent[],
      private readonly pastLivestreams: LivestreamEvent[],
      // control if the service should log debug info
      // when generating the newsletter, we don't want to log
      debug = true
   ) {
      super(functions.logger, debug)
   }

   async getRecommendations(limit = 10): Promise<string[]> {
      const promises: Promise<RankedLivestreamEvent[]>[] = []

      if (this.user) {
         // Fetch top {limit} recommended events based on the user's Metadata
         promises.push(
            Promise.resolve(
               this.getRecommendedEventsBasedOnUserData(
                  this.user,
                  this.futureLivestreams,
                  10
               )
            )
         ),
            // Fetch top {limit} recommended events based on the user actions, e.g. the events they have attended
            promises.push(this.getRecommendedEventsBasedOnUserActions(10))
      }

      // Await all promises
      const recommendedEvents = await handlePromisesAllSettled(
         promises,
         this.log.error
      )

      return this.process(
         recommendedEvents,
         limit,
         this.futureLivestreams,
         this.user
      )
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
      // Get only the events the user has previously registered
      const livestreamsUserRegistered = this.pastLivestreams.filter((s) =>
         s.registeredUsers?.includes(this.user?.userEmail)
      )

      const livestreamBasedRecommendations =
         new LivestreamBasedRecommendationsBuilder(
            limit,
            livestreamsUserRegistered,
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
