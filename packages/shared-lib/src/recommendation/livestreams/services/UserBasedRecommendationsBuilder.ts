import { AdditionalUserRecommendationInfo, UserData } from "../../../users"
import { ImplicitLivestreamRecommendationData } from "../ImplicitLivestreamRecommendationData"
import { RankedLivestreamEvent } from "../RankedLivestreamEvent"
import { RecommendationsBuilder } from "../RecommendationsBuilder"
import { ImplicitDataRepository } from "../implicit/ImplicitDataRepository"
import { RankedLivestreamRepository } from "./RankedLivestreamRepository"

export class UserBasedRecommendationsBuilder extends RecommendationsBuilder {
   private implicitDataRepo: ImplicitDataRepository
   private userAdditionalInfo: AdditionalUserRecommendationInfo = {
      studyBackgrounds: [],
      languages: [],
   }

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

   public setAdditionalData(data: AdditionalUserRecommendationInfo) {
      this.userAdditionalInfo = data
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

   public userContentTopicTags() {
      if (this.user.contentTopicsTagIds?.length) {
         // Fetch recommended events based on the user's content topics tag ids against events content topic tags
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnContentTopicTags(
               this.user.contentTopicsTagIds,
               this.limit
            )
         )
      }

      return this
   }

   public userBusinessFunctionsTags() {
      if (this.user.businessFunctionsTagIds?.length) {
         // Fetch recommended events based on the user's business functions tag ids against events business functions tags
         this.addResults(
            this.rankedLivestreamRepo.getEventsBasedOnBusinessFunctionTags(
               this.user.businessFunctionsTagIds,
               this.limit
            )
         )
      }

      return this
   }

   public userStudyBackground() {
      if (this.userAdditionalInfo?.studyBackgrounds?.length) {
         // Fetch recommended events based on the user's study background
         this.userAdditionalInfo.studyBackgrounds.forEach((studyBackground) => {
            console.log(
               "🚀 ~ UserBasedRecommendationsBuilder ~ userStudyBackground ~ studyBackground.fieldOfStudy:",
               studyBackground.fieldOfStudy
            )
            this.addResults(
               this.rankedLivestreamRepo.getEventsBasedOnFieldOfStudies(
                  [studyBackground.fieldOfStudy],
                  this.limit
               )
            )
         })
      }

      return this
   }

   public userLanguages() {
      if (this.userAdditionalInfo?.languages?.length) {
         // Fetch recommended events based on the user's study background
         this.userAdditionalInfo.languages.forEach((language) => {
            console.log(
               "🚀 ~ UserBasedRecommendationsBuilder ~ languages ~ language:",
               language
            )
            this.addResults(
               this.rankedLivestreamRepo.getEventsBasedOnSpokenLanguages([
                  language.languageId,
               ])
            )
         })
      }

      return this
   }

   // Implicit Data

   public userImplicitFollowedCompanies() {
      this.addImplicitResults(
         (implicitDataRepo) => {
            return implicitDataRepo.getFollowedCompanyIds()
         },
         (values) => {
            const res = this.rankedLivestreamRepo.getEventsBasedOnCompanies(
               values,
               this.limit
            )
            return res
         }
      )

      return this
   }

   public userImplicitInteractedEventsCompanyCountry() {
      this.addImplicitResults(
         (implicitDataRepo) => {
            return implicitDataRepo.getInteractedEventsCompanyCountries()
         },
         (values) => {
            return this.rankedLivestreamRepo.getEventsBasedOnImplicitEventsCompanyCountries(
               values,
               this.limit
            )
         }
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

   /**
    * Facilitates usage of implicit data, delegating the check of implicit date repository to this single method
    * which also takes 2 functions as parameters, which when combined can be used to add to the results
    * by calling this.addResults.
    *
    * Simplification of i.e this.userCountriesOfInterest
    * @param valuesGetter Function for retrieving the data to fetch events from.
    * @param eventsGetter Function for retrieving events using the results from calling @param valuesGetter
    */
   private addImplicitResults<T>(
      valuesGetter: (implicitDataRepo: ImplicitDataRepository) => T[],
      eventsGetter: (values: T[]) => RankedLivestreamEvent[]
   ) {
      if (this.implicitDataRepo) {
         const values = valuesGetter(this.implicitDataRepo)
         if (values?.length) {
            this.addResults(eventsGetter(values))
         }
      }
   }
}
