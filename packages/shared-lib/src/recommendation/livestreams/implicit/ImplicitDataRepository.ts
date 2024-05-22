import { ImplicitLivestreamRecommendationData } from "../ImplicitLivestreamRecommendationData"

/**
 * Repository that calculates live streams data, accordingly with some filters and implicit data.
 */
export class ImplicitDataRepository {
   constructor(private readonly data: ImplicitLivestreamRecommendationData) {}

   // Mainly using methods as to compute values on demand
   // If performance becomes an issue due to multiple usages and always computing on demand
   // this can be made lazy, by storing in memory after the calculation.

   // Interacted Live streams

   public getInteractedEventsCompanyCountries(): string[] {
      const countryIds = (
         this.data.watchedLivestreams?.flatMap(
            (event) => event.companyCountries
         ) || []
      )?.filter(Boolean)

      return this.uniqueArray(countryIds)
   }

   public getInteractedEventsCompanyIndustries(): string[] {
      const industryIds = this.uniqueArray(
         (
            this.data.watchedLivestreams?.flatMap(
               (event) => event.companyIndustries
            ) || []
         )?.filter(Boolean)
      )

      return industryIds
   }

   public getInteractedEventsCompanySizes(): string[] {
      const sizes = this.uniqueArray(
         (
            this.data.watchedLivestreams?.flatMap(
               (event) => event.companySizes
            ) || []
         )?.filter(Boolean) || []
      )
      return sizes
   }

   public getInteractedEventsInterests(): string[] {
      const interestIds = this.uniqueArray(
         (
            this.data.watchedLivestreams?.flatMap(
               (event) => event.interestsIds
            ) || []
         )?.filter(Boolean) || []
      )
      return interestIds
   }

   public getInteractedEventsLanguages(): string[] {
      const languageCodes = this.uniqueArray(
         (
            this.data.watchedLivestreams?.map(
               (event) => event.language?.code
            ) || []
         )?.filter(Boolean) || []
      )
      return languageCodes
   }

   // Watched Sparks

   public getWatchedSparksCompanyCountries(): string[] {
      const countryIds = this.uniqueArray(
         this.data.watchedSparks
            ?.map((spark) => spark.group?.companyCountry?.id)
            .filter(Boolean) || []
      )

      console.log(
         "🚀 ~ ImplicitDataRepository ~ getWatchedSparksCompanyCountries ~ countryIds:",
         countryIds
      )

      return countryIds
   }

   public getWatchedSparksCompanyIndustries(): string[] {
      // Using variable for debugging
      const industries =
         this.data.watchedSparks
            ?.flatMap((spark) => {
               return spark.group?.companyIndustries?.map(
                  (industry) => industry.id
               )
            })
            ?.filter(Boolean) || []

      return this.uniqueArray(industries)
   }

   public getWatchedSparksCompanySizes(): string[] {
      const sizes = this.uniqueArray(
         this.data.watchedSparks
            ?.map((spark) => spark.group?.companySize)
            ?.filter(Boolean) || []
      )
      return sizes
   }

   // Applied Jobs

   public getAppliedJobsCompanyCountries(): string[] {
      const countryIds = this.uniqueArray(
         this.data.appliedJobs
            ?.map((jobApplication) => jobApplication.companyCountry)
            ?.filter(Boolean) || []
      )
      return countryIds
   }

   public getAppliedJobsCompanyIndustries(): string[] {
      const appliedJobs = this.uniqueArray(
         this.data.appliedJobs
            ?.flatMap((jobApplication) => jobApplication.companyIndustries)
            ?.filter(Boolean) || []
      )
      return appliedJobs
   }

   public getAppliedJobsCompanySizes(): string[] {
      const sizes = this.uniqueArray(
         this.data.appliedJobs
            ?.map((jobApplication) => jobApplication.companySize)
            ?.filter(Boolean) || []
      )
      return sizes
   }

   // Companies followed
   public getFollowedCompanyIds(): string[] {
      const groupIds = (
         this.data.followedCompanies?.flatMap(
            (following) => following.groupId
         ) || []
      )?.filter(Boolean)

      return this.uniqueArray(groupIds)
   }

   private uniqueArray<T>(items: T[]) {
      return items.filter(
         (value, index, array) => array.indexOf(value) === index
      )
   }
}
