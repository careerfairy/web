import functions = require("firebase-functions")

import { UserData } from "@careerfairy/shared-lib/dist/users"
import { IUserRepository } from "@careerfairy/shared-lib/dist/users/UserRepository"
import { removeDuplicateDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   getEarliestEventBufferTime,
   LivestreamEvent,
} from "@careerfairy/shared-lib/dist/livestreams"

import RecommendationServiceCore, {
   IRecommendationService,
} from "../IRecommendationService"
import { mapFirestoreAdminSnapshots } from "../../../util"
import { userEventRecommendationService } from "../../../api/services"
import { handlePromisesAllSettled, RankedLivestreamEvent } from "../util"

type FirebaseAdmin = typeof import("firebase-admin") // This only imports the types at compile time and not the actual library at runtime

const serviceName = "user_event_recommendation_service"

type RankEventsArgs = {
   rankedLivestreams: RankedLivestreamEvent[]
   targetUserIds: string[]
   targetLivestreamIdsGetter: keyof Pick<
      RankedLivestreamEvent,
      "getFieldOfStudyIds" | "getInterestIds"
   >
   pointsPerMatch: number
}
export default class UserEventRecommendationService
   extends RecommendationServiceCore
   implements IRecommendationService
{
   private readonly pointsPerInterestMatch = 1
   private readonly pointsPerFieldOfStudyMatch = 1
   private readonly firestore: ReturnType<FirebaseAdmin["firestore"]>

   constructor(
      firebaseAdmin: FirebaseAdmin,
      private readonly userRepo: IUserRepository
   ) {
      super(serviceName, functions.logger)
      this.firestore = firebaseAdmin.firestore()
      this.userRepo = userRepo
   }

   async getRecommendations(userId: string, limit = 10): Promise<string[]> {
      const userData = await this.userRepo.getUserDataById(userId)

      const promises: Promise<RankedLivestreamEvent[]>[] = []

      if (userData) {
         // Fetch top {limit} recommended events based on the user's Metadata
         promises.push(this.getRecommendedEventsBasedOnUserData(userData, 10))

         // TODO: Fetch top {limit} recommended events based on the user actions, eg. the events they have attended
      }

      const recommendedEvents = await handlePromisesAllSettled(
         promises,
         this.log.error
      )

      // TODO: Rank Events

      // TODO: Remove duplicates (be sure to remove duplicates before sorting)
      const deDupedEvents = removeDuplicateDocuments(recommendedEvents.flat())

      // Log some debug info
      this.log.info("Metadata", {
         userMetaData: {
            userId: userData?.id || "N/A",
            userInterestIds: userData?.interestsIds || [],
            userFieldOfStudyId: userData?.fieldOfStudy?.id || "N/A",
         },
         eventMetaData: deDupedEvents.map((e) => ({
            id: e.id,
            numPoints: e.points,
            fieldsOfStudyIds: e.getFieldOfStudyIds(),
            interestIds: e.getInterestIds(),
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

      return recommendedIds
   }

   private async getRecommendEventsBasedOnUserInterests(
      user: UserData,
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      const userInterestIds = user.interestsIds

      const query = this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("hidden", "==", false)
         .where("interestsIds", "array-contains-any", userInterestIds)
         .orderBy("start", "asc")
         .limit(limit)

      const snapshots = await query.get()

      const events = mapFirestoreAdminSnapshots<LivestreamEvent>(snapshots).map(
         RankedLivestreamEvent.create
      )

      return this.rankEvents({
         pointsPerMatch: this.pointsPerInterestMatch,
         rankedLivestreams: events,
         targetUserIds: userInterestIds,
         targetLivestreamIdsGetter: "getInterestIds",
      })
   }

   private async getRecommendEventsBasedOnUserFieldOfStudy(
      user: UserData,
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      let query = this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("hidden", "==", false)

      if (user.fieldOfStudy) {
         query = query.where(
            "targetFieldsOfStudy",
            "array-contains",
            user.fieldOfStudy
         )
      }

      query = query.orderBy("start", "asc").limit(limit)

      const snapshots = await query.get()

      const events = mapFirestoreAdminSnapshots<LivestreamEvent>(snapshots).map(
         RankedLivestreamEvent.create
      )

      const userFieldOfStudyId = user.fieldOfStudy?.id

      return this.rankEvents({
         pointsPerMatch: this.pointsPerFieldOfStudyMatch,
         rankedLivestreams: events,
         targetUserIds: userFieldOfStudyId ? [userFieldOfStudyId] : [],
         targetLivestreamIdsGetter: "getInterestIds",
      })
   }

   private async getRecommendedEventsBasedOnUserData(
      userData: UserData,
      limit: number
   ): Promise<RankedLivestreamEvent[]> {
      const promises: Promise<RankedLivestreamEvent[]>[] = []

      if (userData.interestsIds?.length) {
         promises.push(
            // Fetch recommended events based on the user's interests
            this.getRecommendEventsBasedOnUserInterests(userData, limit)
         )
      }

      if (userData.fieldOfStudy?.id) {
         promises.push(
            // Fetch the top recommended events based on the user's field of study
            this.getRecommendEventsBasedOnUserFieldOfStudy(userData, limit)
         )
      }

      const arrayOfRecommendedEventsBasedOnUserData =
         await handlePromisesAllSettled(promises, this.log.error)

      // Combine the results from the two queries above and remove duplicates
      const uniqueResults = removeDuplicateDocuments(
         arrayOfRecommendedEventsBasedOnUserData.filter(Boolean).flat()
      )

      // Return the results sorted by points
      return this.sortRankedLivestreamEventByPoints(uniqueResults)
   }

   private rankEvents({
      pointsPerMatch,
      rankedLivestreams,
      targetLivestreamIdsGetter,
      targetUserIds,
   }: RankEventsArgs): RankedLivestreamEvent[] {
      rankedLivestreams.forEach((rankedLivestream) => {
         const numMatches = rankedLivestream[
            targetLivestreamIdsGetter
         ]().filter((livestreamDataId) =>
            targetUserIds.includes(livestreamDataId)
         ).length

         rankedLivestream.addPoints(numMatches * pointsPerMatch)
      })

      return this.sortRankedLivestreamEventByPoints(rankedLivestreams)
   }

   private sortRankedLivestreamEventByPoints(
      rankedLivestreamEvents: RankedLivestreamEvent[]
   ): RankedLivestreamEvent[] {
      return [...rankedLivestreamEvents].sort(
         (a, b) => b.getPoints() - a.getPoints()
      )
   }
}
