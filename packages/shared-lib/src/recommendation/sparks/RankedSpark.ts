import { SparkStats } from "../../sparks/sparks"

export class RankedSpark {
   public points: number
   public id: string

   constructor(public model: SparkStats) {
      this.model = model
      this.id = model.id
      // Divide popularity by the median value and ensure the minimum value is 1
      this.points = model?.popularity
         ? model.popularity / 120 < 1
            ? 1
            : model.popularity / 120
         : 1
   }

   getId(): string {
      return this.id
   }

   getCompanyCountryId(): string {
      return this.model.spark.group.companyCountry.id
   }

   getCompanyIndustryIds(): string[] {
      return this.model.spark.group.companyIndustries.map((e) => e.id)
   }

   getCompanySize(): string {
      return this.model.spark.group.companySize
   }

   getCategoryId(): string {
      return this.model.spark.category.id
   }

   getCompanyTargetCountriesIds(): string[] {
      return this.model.spark.group?.targetedCountries.map((e) => e.id) || []
   }

   getCompanyTargetFieldsOfStudyIds(): string[] {
      return (
         this.model.spark.group?.targetedFieldsOfStudy.map((e) => e.id) || []
      )
   }

   getCompanyTargetUniversityCountryIds(): string[] {
      return (
         this.model.spark.group?.targetedUniversities.map((e) => e.country) ||
         []
      )
   }

   getCompanyTargetUniversityIds(): string[] {
      return this.model.spark.group?.targetedUniversities.map((e) => e.id) || []
   }

   static create(sparkStats: SparkStats) {
      return new RankedSpark(sparkStats)
   }

   addPoints(points: number) {
      this.points += points
   }

   getPoints() {
      return this.points
   }

   removePoints(points: number) {
      this.points -= points
   }

   setPoints(points: number) {
      this.points = points
   }
}
