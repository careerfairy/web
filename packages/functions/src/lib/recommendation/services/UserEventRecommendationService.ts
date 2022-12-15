import functions = require("firebase-functions")
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { IUserRepository } from "@careerfairy/shared-lib/dist/users/UserRepository"
import { ILivestreamRepository } from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"
import { removeDuplicateDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   getEarliestEventBufferTime,
   LivestreamEvent,
   UserParticipatingStats,
} from "@careerfairy/shared-lib/dist/livestreams"

import RecommendationServiceCore, {
   IRecommendationService,
} from "../IRecommendationService"
import { mapFirestoreAdminSnapshots } from "../../../util"
import { userEventRecommendationService } from "../../../api/services"
import { handlePromisesAllSettled, RankedLivestreamEvent } from "../util"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"

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
      private readonly userRepo: IUserRepository,
      private readonly livestreamRepo: ILivestreamRepository
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
      const sortedResults = this.sortRankedLivestreamEventByPoints(
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

   private async getRecommendEventsBasedOnInterests(
      interestIds: string[],
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      const query = this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("hidden", "==", false)
         .where("interestsIds", "array-contains-any", interestIds.slice(0, 10))
         .orderBy("start", "asc")
         .limit(limit)

      const snapshots = await query.get()

      const events = mapFirestoreAdminSnapshots<LivestreamEvent>(snapshots).map(
         RankedLivestreamEvent.create
      )

      return this.rankEvents({
         pointsPerMatch: this.pointsPerInterestMatch,
         rankedLivestreams: events,
         targetUserIds: interestIds.slice(0, 10),
         targetLivestreamIdsGetter: "getInterestIds",
      })
   }

   private async getRecommendEventsBasedOnFieldOfStudies(
      fieldOfStudies: FieldOfStudy[],
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      const query = this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("hidden", "==", false)
         .where(
            "targetFieldsOfStudy",
            "array-contains-any",
            fieldOfStudies.slice(0, 10)
         )
         .orderBy("start", "asc")
         .limit(limit)

      const snapshots = await query.get()

      const events = mapFirestoreAdminSnapshots<LivestreamEvent>(snapshots).map(
         RankedLivestreamEvent.create
      )

      return this.rankEvents({
         pointsPerMatch: this.pointsPerFieldOfStudyMatch,
         rankedLivestreams: events,
         targetUserIds: fieldOfStudies.map((f) => f.id),
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
            this.getRecommendEventsBasedOnInterests(
               userData.interestsIds,
               limit
            )
         )
      }

      if (userData.fieldOfStudy?.id) {
         promises.push(
            // Fetch the top recommended events based on the user's field of study
            this.getRecommendEventsBasedOnFieldOfStudies(
               [userData.fieldOfStudy],
               limit
            )
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
      const sortedResults = this.sortRankedLivestreamEventByPoints(
         arrayOfRecommendedEventsBasedOnUserActions.flat()
      )

      // Combine the results from the two queries above and remove duplicates
      return removeDuplicateDocuments(sortedResults)
   }

   private async getMostRecentlyWatchedEvents(
      userId: string
   ): Promise<LivestreamEvent[]> {
      // Get most recently watched event stats
      const snaps = await this.firestore
         .collectionGroup("participatingStats")
         .where("id", "==", userId)
         .orderBy("livestream.start", "desc")
         .limit(10)
         .get()

      const participatingStats =
         mapFirestoreAdminSnapshots<UserParticipatingStats>(snaps)

      // sort results by watch time
      const sortedParticipatingStats = participatingStats.sort(
         (a, b) => b.totalMinutes - a.totalMinutes
      )

      // Get the livestreams from the participating stats
      const livestreamIds = sortedParticipatingStats
         .map((stats) => stats.livestreamId)
         .filter(Boolean)

      return this.livestreamRepo.getLivestreamsByIds(livestreamIds)
   }

   private async getRecommendedEventsBasedOnPreviousWatchedEvents(
      userId: string,
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      // Get most recently watched events
      const mostRecentlyWatchedEvents = await this.getMostRecentlyWatchedEvents(
         userId
      )

      // Get most common Interests from the most recently watched events
      const mostCommonInterestIds = this.getMostCommonInterestIds(
         mostRecentlyWatchedEvents
      )

      // Get most common Fields of Study from the most recently watched events
      const mostCommonFieldsOfStudy = this.getMostCommonFieldsOfStudies(
         mostRecentlyWatchedEvents
      )

      const promises: Promise<RankedLivestreamEvent[]>[] = []

      if (mostCommonInterestIds.length) {
         promises.push(
            // Get recommended events based on most common interests
            this.getRecommendEventsBasedOnInterests(
               mostCommonInterestIds,
               limit
            )
         )
      }

      if (mostCommonFieldsOfStudy.length) {
         promises.push(
            // Get recommended events based on most common fields of study
            this.getRecommendEventsBasedOnFieldOfStudies(
               mostCommonFieldsOfStudy,
               limit
            )
         )
      }

      // Get the resolved results from the queries above
      const recommendedEventsBasedOnPreviouslyWatchedEvents =
         await handlePromisesAllSettled(promises, this.log.error)

      return recommendedEventsBasedOnPreviouslyWatchedEvents.flat()
   }

   getMostCommonInterestIds(livestreams: LivestreamEvent[]): string[] {
      // get all interest ids from livestreams
      const interestIds = livestreams
         .flatMap((livestream) => livestream.interestsIds)
         .filter(Boolean)

      // count the number of times each interest id appears
      const interestIdCounts = interestIds.reduce((acc, interestId) => {
         acc[interestId] = acc[interestId] ? acc[interestId] + 1 : 1
         return acc
      }, {} as Record<string, number>)

      // sort the interest ids by the number of times they appear
      return Object.entries(interestIdCounts)
         .sort((a, b) => b[1] - a[1])
         .map((entry) => entry[0])
   }

   getMostCommonFieldsOfStudies(
      livestreams: LivestreamEvent[]
   ): FieldOfStudy[] {
      // get all fields of study from livestreams
      const fieldsOfStudy = livestreams
         .flatMap((livestream) => livestream.targetFieldsOfStudy)
         .filter(Boolean)

      // count the number of times each field of study appears
      const fieldsOfStudyCounts = fieldsOfStudy.reduce((acc, fieldOfStudy) => {
         acc[fieldOfStudy.id] = acc[fieldOfStudy.id]
            ? acc[fieldOfStudy.id] + 1
            : 1
         return acc
      }, {} as Record<string, number>)

      // sort the fields of study by the number of times they appear
      return Object.entries(fieldsOfStudyCounts)
         .sort((a, b) => b[1] - a[1])
         .map((entry) => {
            const fieldOfStudyId = entry[0]
            return fieldsOfStudy.find(
               (fieldOfStudy) => fieldOfStudy.id === fieldOfStudyId
            )
         })
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
         ).length // This is the number of matches between the user's interests or field Of Study and the event's interests or field Of Studies

         rankedLivestream.addPoints(numMatches * pointsPerMatch) // Add points to the event based on the number of matches
      })

      return this.sortRankedLivestreamEventByPoints(rankedLivestreams) // Sort the events by points
   }

   private sortRankedLivestreamEventByPoints(
      rankedLivestreamEvents: RankedLivestreamEvent[]
   ): RankedLivestreamEvent[] {
      return [...rankedLivestreamEvents].sort(
         (a, b) => b.getPoints() - a.getPoints()
      )
   }
}
