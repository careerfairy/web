import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import {
   getEarliestEventBufferTime,
   LivestreamEvent,
   UserParticipatingStats,
} from "@careerfairy/shared-lib/livestreams"
import { ILivestreamRepository } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { mapFirestoreAdminSnapshots } from "src/util"
import {
   RankedLivestreamEvent,
   sortRankedLivestreamEventByPoints,
} from "../util"

// This only imports the types at compile time and not the actual library at runtime
type FirebaseAdmin = typeof import("firebase-admin")

type RankEventsArgs = {
   rankedLivestreams: RankedLivestreamEvent[]
   targetUserIds: unknown[]
   targetLivestreamIdsGetter: (stream: RankedLivestreamEvent) => unknown[]
   pointsPerMatch: number
}

/**
 * Repository that fetches livestreams accordingly with some filters and ranks them
 *
 * Currently fetches the data from Firestore directly but we can
 * update it to fetch the data from a data bundle
 */
export class RankedLivestreamRepository {
   private readonly firestore: ReturnType<FirebaseAdmin["firestore"]>

   private readonly pointsPerInterestMatch = 1
   private readonly pointsPerCountryMatch = 3
   private readonly pointsPerFieldOfStudyMatch = 1
   private readonly pointsPerCompanyIndustryMatch = 2
   private readonly pointsPerCompanySizeMatch = 1

   constructor(
      firebaseAdmin: FirebaseAdmin,
      private readonly livestreamRepo: ILivestreamRepository
   ) {
      this.firestore = firebaseAdmin.firestore()
   }

   public async getEventsBasedOnFieldOfStudies(
      fieldOfStudies: FieldOfStudy[],
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      const events = await this.getEventsFilteredByArrayField(
         "targetFieldsOfStudy",
         fieldOfStudies,
         limit
      )

      return this.rankEvents({
         pointsPerMatch: this.pointsPerFieldOfStudyMatch,
         rankedLivestreams: events,
         targetUserIds: fieldOfStudies.map((f) => f.id),
         targetLivestreamIdsGetter: (stream) => stream.getFieldOfStudyIds(),
      })
   }

   public async getEventsBasedOnCountriesOfInterest(
      countriesOfInterest: string[], // PT, CH, DE, etc.
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      const events = await this.getEventsFilteredByArrayField(
         "companyCountries",
         countriesOfInterest,
         limit
      )

      return this.rankEvents({
         pointsPerMatch: this.pointsPerCountryMatch,
         rankedLivestreams: events,
         targetUserIds: countriesOfInterest,
         targetLivestreamIdsGetter: (stream) => stream.getCompanyCountries(),
      })
   }

   public async getEventsBasedOnIndustries(
      industries: string[],
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      const events = await this.getEventsFilteredByArrayField(
         "companyIndustries",
         industries,
         limit
      )

      return this.rankEvents({
         pointsPerMatch: this.pointsPerCompanyIndustryMatch,
         rankedLivestreams: events,
         targetUserIds: industries,
         targetLivestreamIdsGetter: (stream) => stream.getCompanyIndustries(),
      })
   }

   public async getEventsBasedOnCompanySizes(
      sizes: string[],
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      const events = await this.getEventsFilteredByArrayField(
         "companySizes",
         sizes,
         limit
      )

      return this.rankEvents({
         pointsPerMatch: this.pointsPerCompanySizeMatch,
         rankedLivestreams: events,
         targetUserIds: sizes,
         targetLivestreamIdsGetter: (stream) => stream.getCompanySizes(),
      })
   }

   public async getEventsBasedOnInterests(
      interestIds: string[],
      limit = 10
   ): Promise<RankedLivestreamEvent[]> {
      const events = await this.getEventsFilteredByArrayField(
         "interestsIds",
         interestIds,
         limit
      )

      return this.rankEvents({
         pointsPerMatch: this.pointsPerInterestMatch,
         rankedLivestreams: events,
         targetUserIds: interestIds,
         targetLivestreamIdsGetter: (stream) => stream.getInterestIds(),
      })
   }

   public async getMostRecentlyWatchedEvents(
      userId: string,
      limit: number
   ): Promise<LivestreamEvent[]> {
      // Get most recently watched event stats
      const snaps = await this.firestore
         .collectionGroup("participatingStats")
         .where("id", "==", userId)
         .orderBy("livestream.start", "desc")
         .limit(limit)
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

      if (!livestreamIds.length) {
         return []
      }

      return this.livestreamRepo.getLivestreamsByIds(livestreamIds)
   }

   private getEventsFilteredByArrayField(
      field: keyof LivestreamEvent,
      values: unknown[],
      limit: number
   ): Promise<RankedLivestreamEvent[]> {
      return this.getEvents(
         (query) =>
            query.where(field, "array-contains-any", values.slice(0, 10)),
         limit
      )
   }

   private async getEvents(
      filterQuery: (
         currentQuery: FirebaseFirestore.Query
      ) => FirebaseFirestore.Query,
      limit: number
   ): Promise<RankedLivestreamEvent[]> {
      let query = this.firestore
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .where("hidden", "==", false)

      query = filterQuery(query).orderBy("start", "asc").limit(limit)

      const snapshots = await query.get()

      const events = mapFirestoreAdminSnapshots<LivestreamEvent>(snapshots).map(
         RankedLivestreamEvent.create
      )

      return events
   }

   private rankEvents({
      pointsPerMatch,
      rankedLivestreams,
      targetLivestreamIdsGetter,
      targetUserIds,
   }: RankEventsArgs): RankedLivestreamEvent[] {
      rankedLivestreams.forEach((rankedLivestream) => {
         // This is the number of matches between the user's interests or
         // field Of Study, etc and the event's interests or field Of Studies, etc
         const numMatches = targetLivestreamIdsGetter(rankedLivestream).filter(
            (livestreamDataId) => targetUserIds.includes(livestreamDataId)
         ).length

         // Add points to the event based on the number of matches
         rankedLivestream.addPoints(numMatches * pointsPerMatch)
      })

      return sortRankedLivestreamEventByPoints(rankedLivestreams) // Sort the events by points
   }
}
