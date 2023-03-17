import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Logger } from "../IRecommendationService"
import {
   RankedLivestreamEvent,
   getMostCommonArrayValues,
   getMostCommonFieldsOfStudies,
   handlePromisesAllSettled,
} from "../util"
import { RankedLivestreamRepository } from "./RankedLivestreamRepository"

export class LivestreamBasedRecommendations {
   private promises: Promise<RankedLivestreamEvent[]>[] = []

   constructor(
      private readonly livestreams: LivestreamEvent[],
      private readonly limit: number,
      private readonly rankedLivestreamRepo: RankedLivestreamRepository,
      protected readonly log: Logger
   ) {}

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

   public async get() {
      // Get the resolved results from the promises
      const recommendedEventsBasedOnPreviouslyWatchedEvents =
         await handlePromisesAllSettled(this.promises, this.log.error)

      return recommendedEventsBasedOnPreviouslyWatchedEvents.flat()
   }
}
