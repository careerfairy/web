import { removeDuplicateDocuments } from "../../../BaseFirebaseRepository"
import { FieldOfStudyCategoryMap } from "../../../fieldOfStudy"
import { AdditionalUserRecommendationInfo, UserData } from "../../../users"
import { RecommendationsBuilder } from "../RecommendationsBuilder"
import { RankedSparkRepository } from "./RankedSparkRepository"

export class UserBasedRecommendationsBuilder extends RecommendationsBuilder {
   constructor(
      limit: number,
      private readonly user: UserData,
      private readonly rankedSparkRepo: RankedSparkRepository,
      private readonly userAdditionalInfo: AdditionalUserRecommendationInfo
   ) {
      super(limit)
   }

   public userCountriesOfInterest() {
      if (this.user.countriesOfInterest?.length > 0) {
         // Fetch the top recommended sparks based on the user's countries of interest
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnCountriesOfInterest(
               this.user.countriesOfInterest,
               this.limit
            )
         )
      }

      return this
   }

   public userUniversityCountry() {
      if (this.user.universityCountryCode) {
         // Fetch the top recommended sparks based on the user's university country code
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnUniversityCountryCode(
               this.user.universityCountryCode,
               this.limit
            )
         )
      }

      return this
   }

   public userUniversityCode() {
      if (this.user.university?.code) {
         // Fetch the top recommended sparks based on the user's university code
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnUniversityCode(
               this.user.university.code,
               this.limit
            )
         )
      }

      return this
   }

   public userFieldOfStudy() {
      if (this.user.fieldOfStudy?.id) {
         // Fetch the top recommended sparks based on the user's field of study
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnFieldOfStudies(
               [this.user.fieldOfStudy.id],
               this.limit
            )
         )
      }

      return this
   }

   public userStudyBackground() {
      this.userAdditionalInfo.studyBackgrounds?.forEach((studyBackground) => {
         if (studyBackground.fieldOfStudy?.id) {
            // Fetch the top recommended sparks based on the user's field of study
            this.addResults(
               this.rankedSparkRepo.getSparksBasedOnFieldOfStudies(
                  [studyBackground.fieldOfStudy.id],
                  this.limit
               )
            )
         }
      })

      return this
   }

   public userLanguages() {
      if (this.userAdditionalInfo.languages?.length > 0) {
         // Fetch the top recommended sparks based on the user's languages
         this.addResults(
            this.rankedSparkRepo.getSparksBasedOnLanguages(
               this.userAdditionalInfo.languages.map((lang) => lang.languageId),
               this.limit
            )
         )
      }

      return this
   }

   public userFeaturedGroups() {
      const allResults = removeDuplicateDocuments(
         this.results.filter(Boolean).flat()
      )

      this.setResults(
         this.rankedSparkRepo.applyFeaturedGroupSparkPointsMultiplier(
            allResults,
            this.user?.countryIsoCode,
            this.user?.fieldOfStudy?.id
               ? FieldOfStudyCategoryMap[this.user.fieldOfStudy.id]
               : undefined
         )
      )

      return this
   }
}
