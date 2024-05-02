import { FieldOfStudy } from "../../../fieldOfStudy"
import { LivestreamEvent } from "../../../livestreams"
import { sortLivestreamsDesc } from "../../../utils"
import { RankedLivestreamEvent } from "../../livestreams/RankedLivestreamEvent"
import { sortRankedByPoints } from "../../utils"
import { RECOMMENDATION_POINTS } from "../constants"

type RankEventsArgs = {
   rankedLivestreams: RankedLivestreamEvent[]
   targetUserIds: unknown[]
   targetLivestreamIdsGetter: (stream: RankedLivestreamEvent) => unknown[]
   pointsPerMatch: number
   pointsPerMissingMatch?: number
   missingMatchesMultiplier?: number
}

/**
 * Repository that fetches livestreams accordingly with some filters and ranks them
 *
 * Currently fetches the data from Firestore directly but we can
 * update it to fetch the data from a data bundle
 */
export class RankedLivestreamRepository {
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
         pointsPerMatch: RECOMMENDATION_POINTS.POINTS_PER_FIELD_OF_STUDY_MATCH,
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
         "companyTargetedCountries",
         countriesOfInterest,
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.POINTS_PER_COMPANY_TARGET_COUNTRY_MATCH,
         rankedLivestreams: events,
         targetUserIds: countriesOfInterest,
         targetLivestreamIdsGetter: (stream) =>
            stream.getCompanyTargetCountries(),
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
         pointsPerMatch:
            RECOMMENDATION_POINTS.POINTS_PER_COMPANY_INDUSTRY_MATCH,
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
         pointsPerMatch: RECOMMENDATION_POINTS.POINTS_PER_COMPANY_SIZE_MATCH,
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
         pointsPerMatch: RECOMMENDATION_POINTS.POINTS_PER_INTEREST_MATCH,
         rankedLivestreams: events,
         targetUserIds: interestIds,
         targetLivestreamIdsGetter: (stream) => stream.getInterestIds(),
      })
   }

   public getEventsBasedOnTargetCountry(
      universityCountryCode: string,
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "targetCountries",
         [universityCountryCode],
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.POINTS_PER_UNIVERSITY_COUNTRY_MATCH,
         rankedLivestreams: events,
         targetUserIds: [universityCountryCode],
         targetLivestreamIdsGetter: (stream) => stream.getCompanyCountries(),
      })
   }

   public getEventsBasedOnTargetUniversity(
      universityCode: string,
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "targetUniversities",
         [universityCode],
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.POINTS_PER_TARGET_UNIVERSITY_NAME_MATCH,
         rankedLivestreams: events,
         targetUserIds: [universityCode],
         targetLivestreamIdsGetter: (stream) => stream.getTargetUniversities(),
      })
   }

   public getEventsBasedOnTargetLevelOfStudy(
      levelOfStudyId: string,
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "targetLevelsOfStudy",
         [levelOfStudyId],
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.POINTS_PER_TARGET_LEVEL_OF_STUDY_MATCH,
         rankedLivestreams: events,
         targetUserIds: [levelOfStudyId],
         targetLivestreamIdsGetter: (stream) =>
            stream.getTargetLevelOfStudyIds(),
      })
   }

   public getEventsBasedOnCompanies(
      groupIds: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "groupIds",
         [groupIds],
         limit
      )

      return this.rankEvents({
         pointsPerMatch: RECOMMENDATION_POINTS.POINTS_PER_COMPANY_MATCH,
         rankedLivestreams: events,
         targetUserIds: [groupIds],
         targetLivestreamIdsGetter: (stream) => stream.getGroupIds(),
      })
   }

   public getEventsBasedOnCompanyTargetCountry(
      countryCode: string,
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companyTargetedCountries",
         [countryCode],
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.POINTS_PER_COMPANY_TARGET_COUNTRY_MATCH,
         rankedLivestreams: events,
         targetUserIds: [countryCode],
         targetLivestreamIdsGetter: (stream) =>
            stream.getCompanyTargetCountries(),
      })
   }

   public getEventsBasedOnCompanyTargetUniversities(
      universityCode: string,
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companyTargetedUniversities",
         [universityCode],
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.POINTS_PER_COMPANY_TARGET_UNIVERSITIES_MATCH,
         rankedLivestreams: events,
         targetUserIds: [universityCode],
         targetLivestreamIdsGetter: (stream) =>
            stream.getCompanyTargetUniversities(),
      })
   }

   public getEventsBasedOnCompanyTargetFieldOfStudy(
      fieldsOfStudyIds: string,
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companyTargetedFieldsOfStudies",
         [fieldsOfStudyIds],
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.POINTS_PER_COMPANY_TARGET_FIELDS_OF_STUDY_MATCH,
         rankedLivestreams: events,
         targetUserIds: [fieldsOfStudyIds],
         targetLivestreamIdsGetter: (stream) =>
            stream.getCompanyTargetFieldsOfStudies(),
      })
   }

   public getEventsBasedOnSpokenLanguages(
      spokenLanguages: string[]
   ): RankedLivestreamEvent[] {
      return this.rankEvents({
         pointsPerMatch: RECOMMENDATION_POINTS.POINTS_PER_SPOKEN_LANGUAGE_MATCH,
         pointsPerMissingMatch:
            -RECOMMENDATION_POINTS.POINTS_PER_SPOKEN_LANGUAGE_DEDUCT, // decrease points if the user does not speak the language
         // use all livestreams since we want to decrease the points if the user does not speak the language
         rankedLivestreams: this.livestreams,
         targetUserIds: spokenLanguages,
         targetLivestreamIdsGetter: (stream) => [stream.getLanguage()],
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
      pointsPerMissingMatch = 0,
      missingMatchesMultiplier = 1,
   }: RankEventsArgs): RankedLivestreamEvent[] {
      rankedLivestreams.forEach((rankedLivestream) => {
         // This is the number of matches between the user's interests or
         // field Of Study, etc and the event's interests or field Of Studies, etc

         const targetIds = targetLivestreamIdsGetter(rankedLivestream)

         const numMatches = targetIds.filter((livestreamDataId) =>
            targetUserIds.includes(livestreamDataId)
         ).length

         const numMissingMatches = targetUserIds.length - numMatches

         if (numMissingMatches > 0) {
            const mismatchPoints =
               missingMatchesMultiplier * pointsPerMissingMatch
            console.log(
               "🚀 ~ RankedLivestreamRepository ~ rankedLivestreams.forEach ~ missingMatchesMultiplier,numMissingMatches,pointsPerMissingMatch,mismatches,id: ",
               missingMatchesMultiplier,
               numMissingMatches,
               pointsPerMissingMatch == 0 ? "-00" : pointsPerMissingMatch, // For formatting purposes only
               pointsPerMissingMatch != 0
                  ? `{ targetIds[${targetIds}] <> targetUserIds[${targetUserIds}] }`
                  : "{ no pointsPerMissingMatch }",
               rankedLivestream.model.id
            )
            rankedLivestream.addPoints(mismatchPoints)
         }

         // Add points to the event based on the number of matches
         rankedLivestream.addPoints(numMatches * pointsPerMatch)
      })

      return sortRankedByPoints<RankedLivestreamEvent>(rankedLivestreams) // Sort the events by points
   }
}
