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

      const recommendedEvents: RankedLivestreamEvent[][] = await Promise.all([
         // Fetch top {limit} recommended events based on the user's Metadata
         this.getRecommendedEventsBasedOnUserData(userData, 10),

         // TODO: Fetch top {limit} recommended events based on the user actions, eg. the events they have attended
      ])

      // TODO: Rank Events

      // TODO: Remove duplicates (be sure to remove duplicates before sorting)
      const deDupedEvents = removeDuplicateDocuments(recommendedEvents.flat())

      // Log some debug info
      this.log.info("Metadata", {
         userMetaData: {
            userId: userData.id,
            userInterestIds: userData.interestsIds,
            userFieldOfStudyId: userData.fieldOfStudy.id,
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
   ): Promise<RankedLivestreamEvent[] | null> {
      let query = this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("hidden", "==", false)

      const userInterestIds = user.interestsIds || []

      if (userInterestIds) {
         query = query.where(
            "interestsIds",
            "array-contains-any",
            userInterestIds
         )
      }

      query = query.orderBy("start", "asc").limit(limit)

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
      if (!userData) {
         return []
      }
      const arrayOfRecommendedEventsBasedOnUserData: RankedLivestreamEvent[][] =
         await Promise.all([
            // Fetch recommended events based on the user's interests
            this.getRecommendEventsBasedOnUserInterests(userData, limit),

            // Fetch the top recommended events based on the user's field of study
            this.getRecommendEventsBasedOnUserFieldOfStudy(userData, limit),
         ])

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

class RankedLivestreamEvent {
   public points: number
   public id: string

   constructor(public model: LivestreamEvent) {
      this.model = model
      this.id = model.id
      this.points = 0 // Initial value could also be livestream.popularity once that field is added
   }

   static create(livestream: LivestreamEvent) {
      return new RankedLivestreamEvent(livestream)
   }

   getFieldOfStudyIds(): string[] {
      return this.model.targetFieldsOfStudy.map((e) => e.id)
   }

   getInterestIds(): string[] {
      return this.model.interestsIds || []
   }

   addPoints(points: number) {
      this.points += points
   }

   // removePoints(points: number) {
   //    this.points -= points
   // }

   getPoints() {
      return this.points
   }
}
