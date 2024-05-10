import { ImplicitLivestreamRecommendationData } from "../ImplicitLivestreamRecommendationData"

/**
 * Repository that fetches livestreams accordingly with some filters and ranks them
 *
 * Currently fetches the data from Firestore directly but we can
 * update it to fetch the data from a data bundle
 */
export class ImplicitDataRepository {
   constructor(private readonly data: ImplicitLivestreamRecommendationData) {}

   // Mainly using methods as to compute values on demand
   // If performance becomes an issue due to multiple usages and always computing on demand
   // this can be made lazy, by storing in memory after the calculation.

   // Interacted Livestreams

   public getInteractedEventsCompanyCountries(): string[] {
      return (
         this.data.watchedLivestreams?.flatMap(
            (event) => event.companyCountries
         ) || []
      )
   }

   public getInteractedEventsCompanyIndustries(): string[] {
      return (
         this.data.watchedLivestreams?.flatMap(
            (event) => event.companyIndustries
         ) || []
      )
   }

   public getInteractedEventsCompanySizes(): string[] {
      return (
         this.data.watchedLivestreams?.flatMap((event) => event.companySizes) ||
         []
      )
   }

   public getInteractedEventsInterests(): string[] {
      return (
         this.data.watchedLivestreams?.flatMap((event) => event.interestsIds) ||
         []
      )
   }

   public getInteractedEventsLanguages(): string[] {
      return (
         this.data.watchedLivestreams?.map((event) => event.language?.code) ||
         []
      )
   }

   // Watched Sparks

   public getWatchedSparksCompanyCountries(): string[] {
      return this.data.watchedSparks
         ?.map((spark) => spark.group?.companyCountry?.id)
         .filter(Boolean)
   }

   public getWatchedSparksCompanyIndustries(): string[] {
      console.log(
         "🚀 ~ ImplicitDataRepository ~ industries ~ this.data.watchedSparks:",
         this.data.watchedSparks?.map((s) => {
            return {
               id: s.id,
               indus: s.group?.companyIndustries?.map(
                  (industry) => industry.id
               ),
            }
         })
      )
      // Using variable for debugging
      const industries =
         this.data.watchedSparks
            ?.flatMap((spark) => {
               return spark.group?.companyIndustries?.map(
                  (industry) => industry.id
               )
            })
            ?.filter(Boolean) || []

      console.log("🚀 ~ IMPLICIT INDUSTRIES -> :", industries)

      return this.uniqueArray(industries)
   }

   public getWatchedSparksCompanySizes(): string[] {
      return this.data.watchedSparks?.map((spark) => spark.group?.companySize)
   }

   // Applied Jobs

   public getAppliedJobsCompanyCountries(): string[] {
      return this.data.appliedJobs?.map(
         (jobApplication) => jobApplication.companyCountry
      )
   }

   public getAppliedJobsCompanyIndustries(): string[] {
      return this.data.appliedJobs?.flatMap(
         (jobApplication) => jobApplication.companyIndustries
      )
   }

   public getAppliedJobsCompanySizes(): string[] {
      return this.data.appliedJobs?.map(
         (jobApplication) => jobApplication.companySize
      )
   }

   private uniqueArray<T>(items: T[]) {
      return items.filter(
         (value, index, array) => array.indexOf(value) === index
      )
   }
}
