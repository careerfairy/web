import { FieldOfStudy } from "../../fieldOfStudy"
import { LivestreamEvent } from "../../livestreams"
import { sortLivestreamsDesc } from "../../utils"
import {
   RankedLivestreamEvent,
   sortRankedLivestreamEventByPoints,
} from "../RankedLivestreamEvent"

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
   private readonly pointsPerInterestMatch = 1
   private readonly pointsPerCountryMatch = 3
   private readonly pointsPerFieldOfStudyMatch = 5
   private readonly pointsPerCompanyIndustryMatch = 2
   private readonly pointsPerCompanySizeMatch = 1

   private readonly livestreams: RankedLivestreamEvent[]

   constructor(livestreams: LivestreamEvent[]) {
      const filtered = livestreams
         .filter((stream) => !stream.hidden)
         .filter((stream) => !stream.test)

      // sort in place asc
      filtered.sort((a, b) => sortLivestreamsDesc(b, a))

      this.livestreams = filtered.map(RankedLivestreamEvent.create)
   }

   public getEventsBasedOnFieldOfStudies(
      fieldOfStudies: FieldOfStudy[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
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

   public getEventsBasedOnCountriesOfInterest(
      countriesOfInterest: string[], // PT, CH, DE, etc.
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
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

   public getEventsBasedOnIndustries(
      industries: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
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

   public getEventsBasedOnCompanySizes(
      sizes: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
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

   public getEventsBasedOnInterests(
      interestIds: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
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

   private getEventsFilteredByArrayField(
      field: keyof LivestreamEvent,
      values: unknown[],
      limit: number
   ): RankedLivestreamEvent[] {
      return this.livestreams
         .filter((stream) => {
            const streamArrayField = stream.model[field]
            if (!streamArrayField || !Array.isArray(streamArrayField))
               return false

            return streamArrayField.some((value) => values.includes(value))
         })
         .slice(0, limit)
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
