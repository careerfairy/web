import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { getMostCommonArrayValues } from "@careerfairy/shared-lib/recommendation/utils"
import { RecommendationsBuilder } from "@careerfairy/shared-lib/recommendation/sparks/RecommendationsBuilder"
import { RankedSparkRepository } from "@careerfairy/shared-lib/recommendation/sparks/service/RankedSparkRepository"
import { SparkStats } from "@careerfairy/shared-lib/sparks/sparks"

export class SparkBasedRecommendationsBuilder extends RecommendationsBuilder {
   constructor(
      limit: number,
      private readonly sparks: SparkStats[],
      private readonly participatedEvents: LivestreamEvent[],
      private readonly rankedSparkRepo: RankedSparkRepository
   ) {
      super(limit)
   }

   // Get the most common company country code and add the corresponding sparks to the results
   public mostCommonCompanyCountryCode() {
      const mostCommonCompanyCountryCode = getMostCommonArrayValues<SparkStats>(
         this.sparks,
         (spark) => [spark.spark.group.companyCountry?.id]
      )

      if (mostCommonCompanyCountryCode.length) {
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnCompanyCountry(
               mostCommonCompanyCountryCode,
               this.limit
            )
         )
      }

      return this
   }

   // Get the most common company industries and add the corresponding sparks to the results
   public mostCommonCompanyIndustries() {
      const mostCommonCompanyIndustries = getMostCommonArrayValues<SparkStats>(
         this.sparks,
         (spark) => spark.spark.group.companyIndustries?.map((e) => e?.id)
      )

      if (mostCommonCompanyIndustries.length) {
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnIndustries(
               mostCommonCompanyIndustries,
               this.limit
            )
         )
      }

      return this
   }

   // Get the most common company sizes and add the corresponding sparks to the results
   public mostCommonCompanySizes() {
      const mostCommonCompanySizes = getMostCommonArrayValues<SparkStats>(
         this.sparks,
         (spark) => [spark.spark.group.companySize]
      )

      if (mostCommonCompanySizes.length) {
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnCompanySizes(
               mostCommonCompanySizes,
               this.limit
            )
         )
      }

      return this
   }

   // Get the most common category and add the corresponding sparks to the results
   public mostCommonCategory() {
      const mostCommonCategories = getMostCommonArrayValues<SparkStats>(
         this.sparks,
         (spark) => [spark.spark.category.id]
      )

      if (mostCommonCategories.length) {
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnCategory(
               mostCommonCategories,
               this.limit
            )
         )
      }

      return this
   }

   // Deduct the seen sparks and add the remaining sparks to the results
   public deductSeenSparks() {
      this.addResults(
         this.rankedSparkRepo.deductSeenSparks(this.sparks.map((s) => s.id))
      )

      return this
   }

   // Get the trial plan sparks and add the remaining sparks to the results
   public trialPlanSparks() {
      this.addResults(
         this.rankedSparkRepo.getSparksBasedOnTrialPlan(
            this.sparks.map((s) => s.id)
         )
      )

      return this
   }

   // Get the most common livestream company country code and add the corresponding sparks to the results
   public mostCommonLivestreamCompanyCountryCode() {
      const mostCommonLivestreamCompanyCountries =
         getMostCommonArrayValues<LivestreamEvent>(
            this.participatedEvents,
            (event) => event.companyCountries
         )

      if (mostCommonLivestreamCompanyCountries.length) {
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnCompanyCountry(
               mostCommonLivestreamCompanyCountries,
               this.limit
            )
         )
      }

      return this
   }

   // Get the most common livestream company industries and add the corresponding sparks to the results
   public mostCommonLivestreamCompanyIndustries() {
      const mostCommonLivestreamCompanyIndustries =
         getMostCommonArrayValues<LivestreamEvent>(
            this.participatedEvents,
            (event) => event.companyIndustries
         )

      if (mostCommonLivestreamCompanyIndustries.length) {
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnIndustries(
               mostCommonLivestreamCompanyIndustries,
               this.limit
            )
         )
      }

      return this
   }

   // Get the most common livestream company sizes and add the corresponding sparks to the results
   public mostCommonLivestreamCompanySizes() {
      const mostCommonLivestreamCompanySizes =
         getMostCommonArrayValues<LivestreamEvent>(
            this.participatedEvents,
            (event) => event.companySizes
         )

      if (mostCommonLivestreamCompanySizes.length) {
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnCompanySizes(
               mostCommonLivestreamCompanySizes,
               this.limit
            )
         )
      }

      return this
   }
}
