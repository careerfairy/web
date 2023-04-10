import { UserData } from "../../users"
import { RecommendationsBuilder } from "../RecommendationsBuilder"
import { RankedLivestreamRepository } from "./RankedLivestreamRepository"

export class UserBasedRecommendationsBuilder extends RecommendationsBuilder {
   constructor(
      limit: number,
      private readonly user: UserData,
      private readonly rankedLivestreamRepo: RankedLivestreamRepository
   ) {
      super(limit)
   }

   public userInterests() {
      if (this.user.interestsIds?.length) {
         // Fetch recommended events based on the user's interests
         this.addResults(
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
         // Fetch recommended events based on the user's fields of study
         this.addResults(
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
         // Fetch the top recommended events based on the user's field of study
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnCountriesOfInterest(
               this.user.countriesOfInterest,
               this.limit
            )
         )
      }

      return this
   }
}
