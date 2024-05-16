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
         // use all live streams since we want to decrease the points if the user does not speak the language
         missingMatchesMultiplier: 1, // Ensures that pointsPerMissingMatch is deducted only once for this case
         rankedLivestreams: this.livestreams,
         targetUserIds: spokenLanguages,
         targetLivestreamIdsGetter: (stream) => [stream.getLanguage()],
      })
   }

   /**
    * Even though its very similar to other methods, this one uses implicit points, reason
    * why its a separate method. This allows independent logic for implicit points without having to change
    * current implementation for explicit recommendation.
    */
   public getEventsBasedOnImplicitEventsCompanyCountries(
      countryCodes: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companyCountries",
         countryCodes,
         limit
      )
      console.log(
         "🚀 ~ INTERACTED EVENTS COMPANY CODES ~ countryCodes,events:",
         countryCodes,
         events?.map((e) => e.id)
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_INTERACTED_EVENT_COMPANY_COUNTRY_MATCH,
         rankedLivestreams: events,
         targetUserIds: countryCodes,
         targetLivestreamIdsGetter: (stream) => stream.getCompanyCountries(),
      })
   }

   public getEventsBasedOnImplicitEventsCompanyIndustries(
      industryIds: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companyIndustries",
         industryIds,
         limit
      )
      console.log(
         "🚀 ~ getEventsBasedOnImplicitEventsCompanyIndustries ~ industryIds,events:",
         industryIds,
         events
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_INTERACTED_EVENT_COMPANY_INDUSTRY_MATCH,
         rankedLivestreams: events,
         targetUserIds: industryIds,
         targetLivestreamIdsGetter: (stream) => stream.getCompanyIndustries(),
      })
   }

   public getEventsBasedOnImplicitEventsCompanySize(
      companySizes: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companySizes",
         companySizes,
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_INTERACTED_EVENT_COMPANY_SIZE_MATCH,
         rankedLivestreams: events,
         targetUserIds: companySizes,
         targetLivestreamIdsGetter: (stream) => stream.getCompanySizes(),
      })
   }

   public getEventsBasedOnImplicitEventsInterests(
      interestIds: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "interestsIds",
         interestIds,
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_INTERACTED_EVENT_COMPANY_INTERESTS_MATCH,
         rankedLivestreams: events,
         targetUserIds: interestIds,
         targetLivestreamIdsGetter: (stream) => stream.getInterestIds(),
      })
   }

   public getEventsBasedOnImplicitEventsLanguages(
      languageCodes: string[]
   ): RankedLivestreamEvent[] {
      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_INTERACTED_EVENT_COMPANY_LANGUAGE_MATCH,
         pointsPerMissingMatch:
            -RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_INTERACTED_EVENT_COMPANY_LANGUAGE_DEDUCT, // decrease points if the user does not speak the language
         // use all livestreams since we want to decrease the points if the user does not speak the language
         missingMatchesMultiplier: 1, // Ensures that pointsPerMissingMatch is deducted only once for this case
         rankedLivestreams: this.livestreams,
         targetUserIds: languageCodes,
         targetLivestreamIdsGetter: (stream) => [stream.getLanguage()],
      })
   }

   public getEventsBasedOnImplicitSparksCompanyCountries(
      countryCodes: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companyCountries",
         countryCodes,
         limit
      )
      console.log(
         "🚀 ~ WATCHED SPARKS COUNTRIES ~ countryCodes,events:",
         countryCodes,
         events?.map((e) => e.id)
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_WATCHED_SPARKS_COMPANY_COUNTRY_MATCH,
         rankedLivestreams: events,
         targetUserIds: countryCodes,
         targetLivestreamIdsGetter: (stream) => stream.getCompanyCountries(),
      })
   }

   public getEventsBasedOnImplicitSparksCompanyIndustries(
      industryIds: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companyIndustries",
         industryIds,
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_WATCHED_SPARKS_COMPANY_INDUSTRY_MATCH,
         rankedLivestreams: events,
         targetUserIds: industryIds,
         targetLivestreamIdsGetter: (stream) => stream.getCompanyIndustries(),
      })
   }

   public getEventsBasedOnImplicitSparksCompanySize(
      companySizes: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companySizes",
         companySizes,
         limit
      )
      console.log(
         "🚀 ~ WATCHED SPARKS COMPANY SIZES ~ companySizes,events:",
         companySizes,
         events?.map((e) => e.id)
      )
      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_WATCHED_SPARKS_COMPANY_SIZE_MATCH,
         rankedLivestreams: events,
         targetUserIds: companySizes,
         targetLivestreamIdsGetter: (stream) => stream.getCompanySizes(),
      })
   }

   public getEventsBasedOnImplicitAppliedJobsCompanyCountries(
      countryCodes: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companyCountries",
         countryCodes,
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_APPLIED_JOB_COMPANY_COUNTRY_MATCH,
         rankedLivestreams: events,
         targetUserIds: countryCodes,
         targetLivestreamIdsGetter: (stream) => stream.getCompanyCountries(),
      })
   }

   public getEventsBasedOnImplicitAppliedJobsCompanyIndustries(
      industryIds: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companyIndustries",
         industryIds,
         limit
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_APPLIED_JOB_COMPANY_INDUSTRY_MATCH,
         rankedLivestreams: events,
         targetUserIds: industryIds,
         targetLivestreamIdsGetter: (stream) => stream.getCompanyIndustries(),
      })
   }

   public getEventsBasedOnImplicitAppliedJobsCompanySize(
      companySizes: string[],
      limit = 10
   ): RankedLivestreamEvent[] {
      const events = this.getEventsFilteredByArrayField(
         "companySizes",
         companySizes,
         limit
      )

      console.log(
         "🚀 ~ APPLIED JOBS COMPANY SIZES ~ companySizes,events:",
         companySizes,
         events?.map((e) => e.id)
      )

      return this.rankEvents({
         pointsPerMatch:
            RECOMMENDATION_POINTS.IMPLICIT
               .POINTS_PER_APPLIED_JOB_COMPANY_SIZE_MATCH,
         rankedLivestreams: events,
         targetUserIds: companySizes,
         targetLivestreamIdsGetter: (stream) => stream.getCompanySizes(),
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
            // if (field == "companyIndustries")
            //    console.log(
            //       "🚀 ~ RankedLivestreamRepository ~ .filter ~ id,streamArrayField,values:",
            //       stream.model.id,
            //       streamArrayField,
            //       values
            //    )
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
            const mismatchMultiplier =
               missingMatchesMultiplier !== undefined
                  ? missingMatchesMultiplier
                  : numMissingMatches
            const mismatchPoints = mismatchMultiplier * pointsPerMissingMatch

            rankedLivestream.addPoints(mismatchPoints)
         }

         // Add points to the event based on the number of matches
         rankedLivestream.addPoints(numMatches * pointsPerMatch)
      })

      return sortRankedByPoints<RankedLivestreamEvent>(rankedLivestreams) // Sort the events by points
   }
}
