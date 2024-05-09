import { UserData } from "../../../users"
import { ImplicitLivestreamRecommendationData } from "../ImplicitLivestreamRecommendationData"
import { RankedLivestreamEvent } from "../RankedLivestreamEvent"
import { RecommendationsBuilder } from "../RecommendationsBuilder"
import { ImplicitDataRepository } from "../implicit/ImplicitDataRepository"
import { RankedLivestreamRepository } from "./RankedLivestreamRepository"

export class UserBasedRecommendationsBuilder extends RecommendationsBuilder {
   private implicitDataRepo: ImplicitDataRepository
   constructor(
      limit: number,
      private readonly user: UserData,
      private readonly rankedLivestreamRepo: RankedLivestreamRepository
   ) {
      super(limit)
   }

   public setImplicitData(implicitData: ImplicitLivestreamRecommendationData) {
      this.implicitDataRepo = new ImplicitDataRepository(implicitData)
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
         // Fetch the top recommended events based on the user's countries of interest
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnCountriesOfInterest(
               this.user.countriesOfInterest,
               this.limit
            )
         )
      }

      return this
   }

   public userUniversityCountry() {
      if (this.user.universityCountryCode) {
         // Fetch the top recommended events based on the user's university country code
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnTargetCountry(
               this.user.universityCountryCode,
               this.limit
            )
         )
      }

      return this
   }

   public userSpokenLanguages() {
      if (this.user.spokenLanguages?.length > 0) {
         // Fetch the top recommended events based on the user's spoken languages
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnSpokenLanguages(
               this.user.spokenLanguages
            )
         )
      }

      return this
   }

   public userUniversity() {
      if (this.user.university?.code) {
         // Fetch recommended events based on the user's university code
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnTargetUniversity(
               this.user.university?.code,
               this.limit
            )
         )
      }

      return this
   }

   public userLevelsOfStudy() {
      if (this.user.levelOfStudy?.id) {
         // Fetch recommended events based on the user's levels of study
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnTargetLevelOfStudy(
               this.user.levelOfStudy?.id,
               this.limit
            )
         )
      }

      return this
   }

   public userFollowedCompanies() {
      if (this.user.companyUserFollowsIds?.length) {
         // Fetch recommended events based on the user's followed companies
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnCompanies(
               this.user.companyUserFollowsIds?.map(
                  (following) => following.groupId
               ),
               this.limit
            )
         )
      }

      return this
   }

   public userUniversityCompanyTargetCountry() {
      if (this.user.universityCountryCode) {
         // Fetch recommended events based on the user's university country code against the events company targeted countries
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnCompanyTargetCountry(
               this.user.universityCountryCode,
               this.limit
            )
         )
      }

      return this
   }

   public userCompanyTargetUniversity() {
      if (this.user.universityCountryCode) {
         // Fetch recommended events based on the user's university country code against the events company targeted universities
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnCompanyTargetUniversities(
               this.user.universityCountryCode,
               this.limit
            )
         )
      }

      return this
   }

   public userCompanyTargetFieldsOfStudy() {
      if (this.user.fieldOfStudy?.id) {
         // Fetch recommended events based on the user's field of study against events company targeted fields of study
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnCompanyTargetFieldOfStudy(
               this.user.fieldOfStudy?.id,
               this.limit
            )
         )
      }

      return this
   }

   // Implicit Data

   public userImplicitInteractedEventsCompanyCountry() {
      this.addImplicitResults(
         (implicitDataRepo) => {
            console.log(
               "🚀 ~ UserBasedRecommendationsBuilder ~ CALLED ~ implicitDataRepo:",
               Boolean(implicitDataRepo)
            )
            const result =
               implicitDataRepo.getInteractedEventsCompanyCountries()
            console.log(
               "🚀 ~ UserBasedRecommendationsBuilder ~ userImplicitInteractedEventsCompanyCountry ~ result:",
               result
            )
            return result
         },
         (values) => {
            console.log(
               "🚀 ~ UserBasedRecommendationsBuilder ~ this.addImplicitResults ~ values:",
               values
            )
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitEventsCompanyCountries(
               values,
               this.limit
            )
         }
      )

      console.log(
         "🚀 ~ UserBasedRecommendationsBuilder ~ userImplicitInteractedEventsCompanyCountry ~ ADDDED:"
      )
      return this
   }

   public userImplicitInteractedEventsCompanyIndustries() {
      this.addImplicitResults(
         (implicitDataRepo) =>
            implicitDataRepo.getInteractedEventsCompanyIndustries(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitEventsCompanyIndustries(
               values,
               this.limit
            )
         }
      )

      return this
   }

   public userImplicitInteractedEventsCompanySize() {
      this.addImplicitResults(
         (implicitDataRepo) =>
            implicitDataRepo.getInteractedEventsCompanySizes(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitEventsCompanySize(
               values,
               this.limit
            )
         }
      )

      return this
   }

   public userImplicitInteractedEventsInterests() {
      this.addImplicitResults(
         (implicitDataRepo) => implicitDataRepo.getInteractedEventsInterests(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitEventsInterests(
               values,
               this.limit
            )
         }
      )

      return this
   }

   public userImplicitInteractedEventsLanguage() {
      this.addImplicitResults(
         (implicitDataRepo) => implicitDataRepo.getInteractedEventsLanguages(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitEventsLanguages(
               values
            )
         }
      )

      return this
   }

   public userImplicitWatchedSparksCompanyCountry() {
      this.addImplicitResults(
         (implicitDataRepo) =>
            implicitDataRepo.getWatchedSparksCompanyCountries(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitSparksCompanyCountries(
               values,
               this.limit
            )
         }
      )

      return this
   }

   public userImplicitWatchedSparksCompanyIndustries() {
      this.addImplicitResults(
         (implicitDataRepo) =>
            implicitDataRepo.getWatchedSparksCompanyIndustries(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitSparksCompanyIndustries(
               values,
               this.limit
            )
         }
      )

      return this
   }

   public userImplicitWatchedSparksCompanySize() {
      this.addImplicitResults(
         (implicitDataRepo) => implicitDataRepo.getWatchedSparksCompanySizes(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitSparksCompanySize(
               values,
               this.limit
            )
         }
      )

      return this
   }

   public userImplicitAppliedJobsCompanyCountry() {
      this.addImplicitResults(
         (implicitDataRepo) =>
            implicitDataRepo.getAppliedJobsCompanyCountries(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitAppliedJobsCompanyCountries(
               values,
               this.limit
            )
         }
      )

      return this
   }

   public userImplicitAppliedJobsCompanyIndustries() {
      this.addImplicitResults(
         (implicitDataRepo) =>
            implicitDataRepo.getAppliedJobsCompanyIndustries(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitAppliedJobsCompanyIndustries(
               values,
               this.limit
            )
         }
      )

      return this
   }

   public userImplicitAppliedJobsCompanySize() {
      this.addImplicitResults(
         (implicitDataRepo) => implicitDataRepo.getAppliedJobsCompanySizes(),
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitAppliedJobsCompanySize(
               values,
               this.limit
            )
         }
      )

      return this
   }

   private addImplicitResults(
      valuesGetter: (implicitDataRepo: ImplicitDataRepository) => string[],
      eventsGetter: (values: string[]) => RankedLivestreamEvent[]
   ) {
      if (this.implicitDataRepo) {
         console.log(
            "🚀 ~ UserBasedRecommendationsBuilder ~ addImplicitResults ~ implicitDataRepo: "
         )
         const values = valuesGetter(this.implicitDataRepo)
         console.log(
            "🚀 ~ UserBasedRecommendationsBuilder ~ addImplicitResults ~ values:",
            values
         )
         if (values?.length) {
            this.addResults(eventsGetter(values))
         }
      } else {
         console.log("🚀 ~ UBRB ~ addImplicitResults ~ no implicit data -> ")
      }
   }
}
