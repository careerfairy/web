import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   getMostCommonArrayValues,
   getMostCommonFieldsOfStudies,
} from "@careerfairy/shared-lib/recommendation/livestreams/RankedLivestreamEvent"
import { RecommendationsBuilder } from "@careerfairy/shared-lib/recommendation/RecommendationsBuilder"
import { RankedLivestreamRepository } from "@careerfairy/shared-lib/recommendation/livestreams/services/RankedLivestreamRepository"

export class LivestreamBasedRecommendationsBuilder extends RecommendationsBuilder {
   constructor(
      limit: number,
      private readonly livestreams: LivestreamEvent[],
      private readonly rankedLivestreamRepo: RankedLivestreamRepository
   ) {
      super(limit)
   }

   // Get the most common interest IDs from the livestream events
   public mostCommonInterests() {
      const mostCommonInterestIds = getMostCommonArrayValues(
         this.livestreams,
         (event) => event.interestsIds
      )

      // If there are common interest IDs, add results based on those interests
      if (mostCommonInterestIds.length) {
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnInterests(
               mostCommonInterestIds,
               this.limit
            )
         )
      }

      return this
   }

   // Get the most common countries from the livestream events
   public mostCommonCountries() {
      const mostCommonCountries = getMostCommonArrayValues(
         this.livestreams,
         (event) => event.companyCountries
      )

      // If there are common countries, add results based on those countries
      if (mostCommonCountries.length) {
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnCountriesOfInterest(
               mostCommonCountries,
               this.limit
            )
         )
      }

      return this
   }

   // Get the most common industries from the livestream events
   public mostCommonIndustries() {
      const mostCommonIndustries = getMostCommonArrayValues(
         this.livestreams,
         (event) => event.companyIndustries
      )

      // If there are common industries, add results based on those industries
      if (mostCommonIndustries.length) {
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnIndustries(
               mostCommonIndustries,
               this.limit
            )
         )
      }

      return this
   }

   // Get the most common company sizes from the livestream events
   public mostCommonCompanySizes() {
      const mostCommonCompanySizes = getMostCommonArrayValues(
         this.livestreams,
         (event) => event.companySizes
      )

      // If there are common company sizes, add results based on those sizes
      if (mostCommonCompanySizes.length) {
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnCompanySizes(
               mostCommonCompanySizes,
               this.limit
            )
         )
      }

      return this
   }

   // Get the most common fields of study from the livestream events
   public mostCommonFieldsOfStudy() {
      const mostCommonFieldsOfStudy = getMostCommonFieldsOfStudies(
         this.livestreams
      )

      // If there are common fields of study, add results based on those fields
      if (mostCommonFieldsOfStudy.length) {
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnFieldOfStudies(
               mostCommonFieldsOfStudy,
               this.limit
            )
         )
      }

      return this
   }
}
