import { FieldOfStudy } from "../../fieldOfStudy"
import { LivestreamEvent } from "../../livestreams"
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

      this.points = this.aggregationPoints(this, this.points)
   }

   private additionalPopularityPoints = (
      points: number,
      popularity: number
   ): number => {
      if (popularity == undefined) {
         console.log(
            `🚀 REC_ENGINE{${this.model?.id}-${this.model?.title}}:    popularity: NONE`
         )
         return points
      }

      const resultPoints =
         points + RECOMMENDATION_POINTS.popularityDenominator / popularity

      console.log(
         `🚀 REC_ENGINE{${this.model?.id}-${this.model?.title}}:    popularity: ${popularity} -> ${points} + ${RECOMMENDATION_POINTS.popularityDenominator} / ${popularity} = ${resultPoints}`
      )
      return resultPoints
   }

   private additionalPointsIfJobsLinked = (points: number): number => {
      const resultPoints = points + RECOMMENDATION_POINTS.pointsIfJobsLinked

      console.log(
         `🚀 REC_ENGINE{${this.model?.id}-${this.model?.title}}:    jobsLinked: true -> ${points} + ${RECOMMENDATION_POINTS.pointsIfJobsLinked} = ${resultPoints}`
      )
      return resultPoints
   }

   private aggregationPoints(
      rankedLivestream: RankedLivestreamEvent,
      calculatedPoints: number
   ): number {
      let points = calculatedPoints

      if (rankedLivestream.model?.hasJobs) {
         points = this.additionalPointsIfJobsLinked(points)
      } else {
         console.log(
            `🚀 REC_ENGINE{${this.model?.id}-${this.model?.title}}:    jobsLinked: NONE`
         )
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

   getTargetCountries(): string[] {
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

   addPoints(points: number) {
      this.points += points
   }

   getPoints() {
      return this.points
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
