import { FieldOfStudy } from "../../fieldOfStudy"
import { LivestreamCountryTarget, LivestreamEvent } from "../../livestreams"
import { sortElementsByFrequency } from "../utils"
import { RECOMMENDATION_POINTS } from "./constants"

export class RankedLivestreamEvent {
   public points: number
   public id: string

   constructor(public model: LivestreamEvent) {
      this.model = model
      this.id = model.id
      // Divide popularity by the median value and ensure the minimum value is 1
      this.points = model?.popularity
         ? model.popularity / 120 < 1
            ? 1
            : model.popularity / 120
         : 1

      this.points = this.calculateInitialPoints(this, this.points)
   }

   private additionalPopularityPoints = (
      points: number,
      popularity: number
   ): number => {
      if (!popularity) {
         return points
      }

      // using const to allow debugging if needed
      const calculatedPopularityPoints =
         RECOMMENDATION_POINTS.POPULARITY_NUMERATOR / popularity

      const additionalPoints =
         calculatedPopularityPoints >
         RECOMMENDATION_POINTS.MAX_POPULARITY_POINTS
            ? RECOMMENDATION_POINTS.MAX_POPULARITY_POINTS
            : calculatedPopularityPoints

      const resultPoints = points + additionalPoints

      return resultPoints
   }

   private additionalPointsIfJobsLinked = (points: number): number => {
      const resultPoints = points + RECOMMENDATION_POINTS.POINTS_IF_JOBS_LINKED

      return resultPoints
   }

   private calculateInitialPoints(
      rankedLivestream: RankedLivestreamEvent,
      calculatedPoints: number
   ): number {
      let points = calculatedPoints

      if (rankedLivestream.model?.hasJobs) {
         points = this.additionalPointsIfJobsLinked(points)
      } else {
         // Place holder for debugging when not having jobs
      }

      points = this.additionalPopularityPoints(
         points,
         rankedLivestream.model?.popularity
      )
      return points
   }

   static create(livestream: LivestreamEvent) {
      return new RankedLivestreamEvent(livestream)
   }

   getFieldOfStudyIds(): string[] {
      return this.model.targetFieldsOfStudy.map((e) => e.id) || []
   }

   getInterestIds(): string[] {
      return this.model.interestsIds || []
   }

   getCompanyCountries(): string[] {
      return this.model.companyCountries || []
   }

   getCompanyIndustries(): string[] {
      return this.model.companyIndustries || []
   }

   getCompanySizes(): string[] {
      return this.model.companySizes || []
   }

   getLanguage(): string {
      return this.model.language.code || ""
   }

   getGroupIds(): string[] {
      return this.model?.groupIds
   }

   getTargetUniversities(): string[] {
      return this.model?.targetUniversities || []
   }

   getTargetCountries(): LivestreamCountryTarget[] {
      return this.model?.targetCountries || []
   }

   getTargetLevelOfStudyIds(): string[] {
      return this.model?.targetLevelsOfStudy?.map((level) => level.id) || []
   }

   getCompanyTargetCountries(): string[] {
      return this.model?.companyTargetedCountries || []
   }

   getCompanyTargetUniversities(): string[] {
      return this.model?.companyTargetedUniversities || []
   }

   /* Not to be confused with "this.getFieldOfStudyIds", since this (getCompanyTargetFieldsOfStudies) uses values
    * from backfilled company (group) values
    */
   getCompanyTargetFieldsOfStudies(): string[] {
      return this.model?.companyTargetedFieldsOfStudies || []
   }

   getContentTopicsTagIds(): string[] {
      return this.model?.contentTopicsTagIds || []
   }

   getBusinessFunctionTagIds(): string[] {
      return this.model?.businessFunctionsTagIds || []
   }

   /**
    * Boosts ranking score based on industry and location matches with a reference livestream.
    * Highest points for matching both industry and location (Priority 1),
    * fewer points for industry match only (Priority 2).
    *
    * @param referenceLivestream Livestream to compare similarities against
    * @returns This instance for chaining
    */
   applyReferenceBasedPoints(
      referenceLivestream: LivestreamEvent
   ): RankedLivestreamEvent {
      if (!referenceLivestream || referenceLivestream.id === this.id) {
         return this
      }

      const hasIndustryMatch = this.hasMatchingTag(
         this.getCompanyIndustries(),
         referenceLivestream.companyIndustries || []
      )

      if (!hasIndustryMatch) {
         return this // No industry match, don't add any points
      }

      const hasLocationMatch = this.hasMatchingTag(
         this.getCompanyCountries(),
         referenceLivestream.companyCountries || []
      )

      if (hasLocationMatch) {
         // Priority 1: Industry + Location match
         this.addPoints(
            RECOMMENDATION_POINTS.REFERENCE.INDUSTRY_AND_LOCATION_MATCH_POINTS
         )
      } else {
         // Priority 2: Industry match only
         this.addPoints(
            RECOMMENDATION_POINTS.REFERENCE.INDUSTRY_MATCH_ONLY_POINTS
         )
      }

      return this
   }

   /**
    * Helper method to check if two arrays have any matching elements
    */
   private hasMatchingTag(tags1: string[], tags2: string[]): boolean {
      if (!tags1 || !tags2 || tags1.length === 0 || tags2.length === 0) {
         return false
      }
      return tags1.some((tag) => tags2.includes(tag))
   }

   /**
    * Factory method that creates and ranks an event by similarity to a reference.
    * Implements the business priority logic for livestream recommendations.
    *
    * @param livestream Livestream to rank
    * @param referenceLivestream Reference for similarity comparison
    * @returns New ranked event with appropriate priority points
    */
   static createWithReferencePoints(
      livestream: LivestreamEvent,
      referenceLivestream: LivestreamEvent
   ): RankedLivestreamEvent {
      return RankedLivestreamEvent.create(livestream).applyReferenceBasedPoints(
         referenceLivestream
      )
   }

   addPoints(points: number) {
      this.points += points
   }

   getPoints() {
      return this.points
   }

   setPoints(points: number) {
      this.points = points
   }
}

export function getMostCommonFieldsOfStudies(
   livestreams: LivestreamEvent[]
): FieldOfStudy[] {
   // get all fields of study from livestreams
   const fieldsOfStudy = livestreams
      .flatMap((livestream) => livestream.targetFieldsOfStudy)
      .filter(Boolean)

   const sortedFieldOfStudyIds = sortElementsByFrequency(
      fieldsOfStudy.map((fieldOfStudy) => fieldOfStudy.id)
   )

   // return the fields of study objects sorted by frequency
   return sortedFieldOfStudyIds.map((fieldOfStudyId) =>
      fieldsOfStudy.find((fieldOfStudy) => fieldOfStudy.id === fieldOfStudyId)
   )
}
