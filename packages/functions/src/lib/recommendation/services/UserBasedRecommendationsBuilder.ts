import { UserData } from "@careerfairy/shared-lib/users"
import { Logger } from "../IRecommendationService"
import { RecommendationsBuilder } from "../RecommendationsBuilder"
import { RankedLivestreamRepository } from "./RankedLivestreamRepository"

export class UserBasedRecommendationsBuilder extends RecommendationsBuilder {
   constructor(
      log: Logger,
      limit: number,
      private readonly user: UserData,
      private readonly rankedLivestreamRepo: RankedLivestreamRepository
   ) {
      super(log, limit)
   }

   public userInterests() {
      if (this.user.interestsIds?.length) {
         this.promises.push(
            // Fetch recommended events based on the user's interests
            this.rankedLivestreamRepo.getEventsBasedOnInterests(
               this.user.interestsIds,
               this.limit
            )
         )
      }

      return this
   }

   public userFieldsOfStudy() {
      if (this.user.fieldOfStudy?.id) {
         this.promises.push(
            // Fetch recommended events based on the user's fields of study
            this.rankedLivestreamRepo.getEventsBasedOnFieldOfStudies(
               [this.user.fieldOfStudy],
               this.limit
            )
         )
      }

      return this
   }

   public userCountriesOfInterest() {
      if (this.user.countriesOfInterest?.length > 0) {
         this.promises.push(
            // Fetch the top recommended events based on the user's field of study
            this.rankedLivestreamRepo.getEventsBasedOnCountriesOfInterest(
               this.user.countriesOfInterest,
               this.limit
            )
         )
      }

      return this
   }
}
