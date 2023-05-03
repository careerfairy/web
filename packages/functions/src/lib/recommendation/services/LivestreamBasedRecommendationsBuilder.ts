import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   getMostCommonArrayValues,
   getMostCommonFieldsOfStudies,
} from "@careerfairy/shared-lib/recommendation/RankedLivestreamEvent"
import { RecommendationsBuilder } from "@careerfairy/shared-lib/recommendation/RecommendationsBuilder"
import { RankedLivestreamRepository } from "@careerfairy/shared-lib/recommendation/services/RankedLivestreamRepository"

export class LivestreamBasedRecommendationsBuilder extends RecommendationsBuilder {
   constructor(
      limit: number,
      private readonly livestreams: LivestreamEvent[],
      private readonly rankedLivestreamRepo: RankedLivestreamRepository
   ) {
      super(limit)
   }

   public mostCommonInterests() {
      const mostCommonInterestIds = getMostCommonArrayValues(
         this.livestreams,
         (event) => event.interestsIds
      )

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

   public mostCommonCountries() {
      const mostCommonCountries = getMostCommonArrayValues(
         this.livestreams,
         (event) => event.companyCountries
      )

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

   public mostCommonIndustries() {
      const mostCommonIndustries = getMostCommonArrayValues(
         this.livestreams,
         (event) => event.companyIndustries
      )

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

   public mostCommonCompanySizes() {
      const mostCommonCompanySizes = getMostCommonArrayValues(
         this.livestreams,
         (event) => event.companySizes
      )

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

   public mostCommonFieldsOfStudy() {
      const mostCommonFieldsOfStudy = getMostCommonFieldsOfStudies(
         this.livestreams
      )

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
