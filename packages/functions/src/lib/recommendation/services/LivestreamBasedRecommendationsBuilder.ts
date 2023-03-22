import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Logger } from "../IRecommendationService"
import { RecommendationsBuilder } from "../RecommendationsBuilder"
import { getMostCommonArrayValues, getMostCommonFieldsOfStudies } from "../util"
import { RankedLivestreamRepository } from "./RankedLivestreamRepository"

export class LivestreamBasedRecommendationsBuilder extends RecommendationsBuilder {
   constructor(
      log: Logger,
      limit: number,
      private readonly livestreams: LivestreamEvent[],
      private readonly rankedLivestreamRepo: RankedLivestreamRepository
   ) {
      super(log, limit)
   }

   public mostCommonInterests() {
      const mostCommonInterestIds = getMostCommonArrayValues(
         this.livestreams,
         (event) => event.interestsIds
      )

      if (mostCommonInterestIds.length) {
         this.promises.push(
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
         this.promises.push(
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
         this.promises.push(
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
         this.promises.push(
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
         this.promises.push(
            this.rankedLivestreamRepo.getEventsBasedOnFieldOfStudies(
               mostCommonFieldsOfStudy,
               this.limit
            )
         )
      }

      return this
   }
}
