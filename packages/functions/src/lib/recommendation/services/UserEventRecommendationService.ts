import functions = require("firebase-functions")
import { removeDuplicateDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { ILivestreamRepository } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import { IUserRepository } from "@careerfairy/shared-lib/users/UserRepository"

import { userEventRecommendationService } from "../../../api/services"
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

// This only imports the types at compile time and not the actual library at runtime
type FirebaseAdmin = typeof import("firebase-admin")

const serviceName = "user_event_recommendation_service"

export default class UserEventRecommendationService
   extends RecommendationServiceCore
   implements IRecommendationService
{
   private readonly rankedLivestreamRepo: RankedLivestreamRepository

   constructor(
      firebaseAdmin: FirebaseAdmin,
      readonly userRepo: IUserRepository,
      readonly livestreamRepo: ILivestreamRepository
   ) {
      super(serviceName, functions.logger)
      this.rankedLivestreamRepo = new RankedLivestreamRepository(
         firebaseAdmin,
         livestreamRepo
      )
   }

   async getRecommendations(userId: string, limit = 10): Promise<string[]> {
      const userData = await this.userRepo.getUserDataById(userId)

      const promises: Promise<RankedLivestreamEvent[]>[] = []

      if (userData) {
         // Fetch top {limit} recommended events based on the user's Metadata
         promises.push(this.getRecommendedEventsBasedOnUserData(userData, 10))

         // Fetch top {limit} recommended events based on the user actions, e.g. the events they have attended
         promises.push(
            this.getRecommendedEventsBasedOnUserActions(userData, 10)
         )
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
            userId: userData?.id || "N/A",
            userInterestIds: userData?.interestsIds || [],
            userFieldOfStudyId: userData?.fieldOfStudy?.id || "N/A",
            userCountriesOfInterest: userData?.countriesOfInterest || [],
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
         `Recommended event IDs for user ${userId}: ${recommendedIds}`,
         {
            serviceName: userEventRecommendationService.serviceName,
         }
      )

      this.log.info(
         `Total document reads: ${this.rankedLivestreamRepo.totalReads()}`
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
         this.rankedLivestreamRepo
      )

      return userRecommendationBuilder
         .userInterests()
         .userFieldsOfStudy()
         .userCountriesOfInterest()
         .get()
   }

   private async getRecommendedEventsBasedOnUserActions(
      userData: UserData,
      limit: number
   ): Promise<RankedLivestreamEvent[]> {
      const promises: Promise<RankedLivestreamEvent[]>[] = [
         // Get events based on the user's previously attended events
         this.getRecommendedEventsBasedOnPreviousWatchedEvents(
            userData.id,
            limit
         ),
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
      userId: string,
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      // Get most recently watched events
      const mostRecentlyWatchedEvents =
         await this.rankedLivestreamRepo.getMostRecentlyWatchedEvents(
            userId,
            limit
         )

      // TODO: temporary hack just to count these reads
      this.rankedLivestreamRepo.addReads(mostRecentlyWatchedEvents.length)

      const livestreamBasedRecommendations =
         new LivestreamBasedRecommendationsBuilder(
            this.log,
            limit,
            mostRecentlyWatchedEvents,
            this.rankedLivestreamRepo
         )

      return livestreamBasedRecommendations
         .mostCommonInterests()
         .mostCommonFieldsOfStudy()
         .mostCommonCountries()
         .mostCommonIndustries()
         .mostCommonCompanySizes()
         .get()
   }
}
