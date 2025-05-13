import functions = require("firebase-functions")
import { removeDuplicateDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import RecommendationServiceCore, {
   IRecommendationService,
   applyFeaturedGroupPoints,
} from "@careerfairy/shared-lib/recommendation/livestreams/IRecommendationService"
import {
   AdditionalUserRecommendationInfo,
   RegisteredLivestreams,
   UserData,
} from "@careerfairy/shared-lib/users"

import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { ImplicitLivestreamRecommendationData } from "@careerfairy/shared-lib/recommendation/livestreams/ImplicitLivestreamRecommendationData"
import { RankedLivestreamEvent } from "@careerfairy/shared-lib/recommendation/livestreams/RankedLivestreamEvent"
import { RankedLivestreamRepository } from "@careerfairy/shared-lib/recommendation/livestreams/services/RankedLivestreamRepository"
import {
   handlePromisesAllSettled,
   sortRankedByPoints,
} from "@careerfairy/shared-lib/recommendation/utils"
import { IRecommendationDataFetcher } from "./services/DataFetcherRecommendations"
import { LivestreamBasedRecommendationsBuilder } from "./services/LivestreamBasedRecommendationsBuilder"

/**
 * Best livestreams for a user based on their Metadata
 * and recent past events
 */
export default class UserEventRecommendationService
   extends RecommendationServiceCore
   implements IRecommendationService
{
   private additionalUserData: AdditionalUserRecommendationInfo
   private featuredGroups?: { [groupId: string]: Group }
   /**
    * The filtered livestreams to consider for recommendations
    * This is the futureLivestreams filtered out of ended livestreams and registered livestreams
    */
   private filteredLivestreams: LivestreamEvent[] = []
   private referenceLivestream: LivestreamEvent | null = null

   constructor(
      private readonly user: UserData,
      private readonly futureLivestreams: LivestreamEvent[],
      private readonly pastLivestreams: LivestreamEvent[],
      private readonly implicitData?: ImplicitLivestreamRecommendationData,
      private readonly registeredLivestreams?: RegisteredLivestreams,
      // control if the service should log debug info
      // when generating the newsletter, we don't want to log
      debug = true
   ) {
      super(functions.logger, debug)
   }

   /**
    * Sets a reference livestream to be used for recommendations
    * @param livestream The reference livestream
    * @returns This service instance for chaining
    */
   setReferenceLivestream(
      livestream: LivestreamEvent | null
   ): UserEventRecommendationService {
      this.referenceLivestream = livestream
      return this
   }

   /**
    * Asynchronous function to get recommendations
    *
    * @param limit - The maximum number of recommended events to retrieve
    * @returns A promise that resolves to an array of recommended event IDs
    */
   async getRecommendations(limit = 10): Promise<string[]> {
      // Filter out ended livestreams and registered livestreams
      this.filteredLivestreams = this.futureLivestreams.filter((livestream) => {
         // Filter out livestreams that have ended
         if (livestream.hasEnded) {
            return false
         }

         // Filter out registered livestreams if there are any
         if (
            this.registeredLivestreams?.registeredLivestreams &&
            this.registeredLivestreams.registeredLivestreams[livestream.id]
         ) {
            return false
         }

         // Filter out the reference livestream if it exists
         if (
            this.referenceLivestream &&
            livestream.id === this.referenceLivestream.id
         ) {
            return false
         }

         return true
      })

      const promises: Promise<RankedLivestreamEvent[]>[] = []

      // 1. Reference livestream based recommendations (highest priority)
      if (this.referenceLivestream) {
         promises.push(
            Promise.resolve(
               this.getReferenceLivestreamBasedRankedRecommendations()
            )
         )
      }

      // 2. User metadata based recommendations
      if (this.user) {
         promises.push(
            Promise.resolve(
               this.getRecommendedEventsBasedOnUserData(
                  this.user,
                  this.filteredLivestreams,
                  limit,
                  this.implicitData,
                  this.additionalUserData,
                  this.featuredGroups
               )
            )
         )

         // 3. User actions based recommendations
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
         this.filteredLivestreams,
         this.user
      )
   }

   /**
    * Builds ranked recommendations based on a reference livestream using priority rules.
    * Priority 1: Matching industry AND matching location (high score)
    * Priority 2: Matching industry BUT different location (medium score)
    */
   private getReferenceLivestreamBasedRankedRecommendations(): RankedLivestreamEvent[] {
      if (!this.referenceLivestream) return []

      if (!this.referenceLivestream?.companyIndustries?.length) return []

      return this.filteredLivestreams
         .map((livestream) =>
            RankedLivestreamEvent.createWithReferencePoints(
               livestream,
               this.referenceLivestream
            )
         )
         .filter((rankedEvent) => rankedEvent.getPoints() > 100) // Filter out events that didn't get reference points
   }

   public setFeaturedGroups(featuredGroups: {
      [groupId: string]: Group
   }): UserEventRecommendationService {
      this.featuredGroups = featuredGroups
      return this
   }

   public setAdditionalData(
      data: AdditionalUserRecommendationInfo
   ): UserEventRecommendationService {
      this.additionalUserData = data
      return this
   }

   /**
    * Asynchronous function to get recommended events based on user actions
    *
    * @param limit - The maximum number of recommended events to retrieve
    * @returns A promise that resolves to an array of recommended event IDs
    */
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
      const sortedResults = sortRankedByPoints<RankedLivestreamEvent>(
         arrayOfRecommendedEventsBasedOnUserActions.flat()
      )

      // Combine the results from the two queries above and remove duplicates
      return removeDuplicateDocuments(sortedResults)
   }

   /**
    * Asynchronous function to get recommended events based on previously watched events
    *
    * @param limit - The maximum number of recommended events to retrieve
    * @returns A promise that resolves to an array of recommended event IDs
    */
   private async getRecommendedEventsBasedOnPreviousWatchedEvents(
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      // Get only the events the user has previously registered
      const livestreamsUserRegistered = this.pastLivestreams.filter(
         (livestream) =>
            this.registeredLivestreams?.registeredLivestreams?.[livestream.id]
      )

      const livestreamBasedRecommendations =
         new LivestreamBasedRecommendationsBuilder(
            limit,
            livestreamsUserRegistered,
            new RankedLivestreamRepository(this.filteredLivestreams)
         )

      return livestreamBasedRecommendations
         .mostCommonInterests()
         .mostCommonFieldsOfStudy()
         .mostCommonCountries()
         .mostCommonIndustries()
         .mostCommonCompanySizes()
         .get((rankedLivestream) => {
            return applyFeaturedGroupPoints(
               rankedLivestream,
               this.featuredGroups
            )
         })
   }

   static async create(
      dataFetcher: IRecommendationDataFetcher
   ): Promise<IRecommendationService> {
      const [
         user,
         futureLivestreams,
         pastLivestreams,
         registeredLivestreams,
         studyBackgrounds,
         languages,
         referenceLivestream,
      ] = await Promise.all([
         dataFetcher.getUser(),
         dataFetcher.getFutureLivestreams(),
         dataFetcher.getPastLivestreams(),
         dataFetcher.getUserRegisteredLivestreams(),
         dataFetcher.getUserStudyBackgrounds(),
         dataFetcher.getUserLanguages(),
         dataFetcher.getReferenceLivestream(),
      ])

      const [
         watchedSparks,
         interactedEvents,
         appliedJobs,
         followedCompanies,
         featuredGroups,
      ] = await Promise.all([
         dataFetcher.getWatchedSparks(user.userEmail),
         dataFetcher.getInteractedLivestreams(user.userEmail),
         dataFetcher.getAppliedJobs(user.userEmail),
         dataFetcher.getFollowedCompanies(user.userEmail),
         dataFetcher.getUserFeaturedGroups(user),
      ])

      const userFeaturedGroups = featuredGroups.reduce(
         (acc, group) => ({ ...acc, [group.id]: group }),
         {}
      )

      const implicitData: ImplicitLivestreamRecommendationData = {
         watchedSparks: watchedSparks,
         watchedLivestreams: interactedEvents,
         appliedJobs: appliedJobs,
         followedCompanies: followedCompanies,
      }

      const instance = new UserEventRecommendationService(
         user,
         futureLivestreams,
         pastLivestreams,
         implicitData,
         registeredLivestreams
      )

      return instance
         .setAdditionalData({ studyBackgrounds, languages })
         .setFeaturedGroups(userFeaturedGroups)
         .setReferenceLivestream(referenceLivestream)
   }
}
