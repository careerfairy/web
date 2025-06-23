import { getLocationId } from "../../countries/types"
import { LivestreamEvent } from "../../livestreams/livestreams"
import { CompanyFollowed, StudyBackground, UserData } from "../../users/users"
import { removeDuplicates } from "../../utils"
import { RecommendationsBuilder } from "../RecommendationsBuilder"
import { CustomJob, CustomJobApplicant, CustomJobStats } from "../customJobs"
import { RankedCustomJobsRepository } from "./RankedCustomJobsRepository"

export type UserProfile = {
   userData: UserData | null
   jobApplications: CustomJobApplicant[]
   registeredLivestreams: LivestreamEvent[]
   studyBackgrounds: StudyBackground[]
   followingCompanies: CompanyFollowed[]
}

export type JobStats = Record<string, CustomJobStats>

export type JobsData = {
   customJobs: CustomJob[]
   referenceJob: CustomJob | null
   stats: JobStats | null
}

class BaseRecommendationsBuilder extends RecommendationsBuilder {
   constructor(
      limit: number,
      protected readonly rankedCustomJobsRepo: RankedCustomJobsRepository,
      protected readonly userProfile: UserProfile,
      protected readonly jobsData: JobsData
   ) {
      super(limit)

      this.results = this.rankedCustomJobsRepo.getRankedCustomJobs()
   }

   public jobViews() {
      return this
   }
}
export class UserBasedRecommendationsBuilder extends BaseRecommendationsBuilder {
   constructor(
      limit: number,
      rankedCustomJobsRepo: RankedCustomJobsRepository,
      userProfile: UserProfile,
      jobsData: JobsData
   ) {
      super(limit, rankedCustomJobsRepo, userProfile, jobsData)
   }

   public userCountriesOfInterest() {
      if (!this.userProfile?.userData?.countriesOfInterest?.length) return this

      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnLocations(
         this.userProfile.userData.countriesOfInterest,
         this.rankedCustomJobsRepo.USER_COUNTRIES_OF_INTEREST
      )
      this.addResults(jobs)

      return this
   }

   public userStrictLocation() {
      if (!this.userProfile?.userData?.countryIsoCode) return this

      const location = getLocationId(
         this.userProfile.userData?.countryIsoCode,
         this.userProfile.userData?.stateIsoCode
      )

      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnLocations(
         location ? [location] : [],
         this.rankedCustomJobsRepo.USER_JOB_LOCATION
      )
      this.addResults(jobs)

      return this
   }

   public userBusinessFunctionsTags() {
      if (!this.userProfile?.userData?.businessFunctionsTagIds?.length)
         return this

      const jobs =
         this.rankedCustomJobsRepo.getCustomJobsBusinessFunctionTagIds(
            this.userProfile.userData.businessFunctionsTagIds,
            this.rankedCustomJobsRepo.USER_BUSINESS_FUNCTIONS
         )
      this.addResults(jobs)

      return this
   }

   public userAppliedJobsBusinessFunctionsTags() {
      if (!this.userProfile?.jobApplications?.length) return this

      const tags = removeDuplicates(
         this.userProfile.jobApplications
            .map(
               (application) => application.job?.businessFunctionsTagIds ?? []
            )
            .flat()
      )

      const jobs =
         this.rankedCustomJobsRepo.getCustomJobsBusinessFunctionTagIds(
            tags,
            this.rankedCustomJobsRepo.USER_APPLIED_JOBS_BUSINESS_FUNCTIONS
         )
      this.addResults(jobs)

      return this
   }

   public userStudyBackgroundBusinessFunctionsTags() {
      if (!this.userProfile?.studyBackgrounds?.length) return this

      const businessFunctionsTagIds = removeDuplicates(
         this.userProfile.studyBackgrounds
            ?.map((studyBackground) => studyBackground.fieldOfStudy?.id ?? [])
            ?.flat()
      )

      const jobs =
         this.rankedCustomJobsRepo.getCustomJobsBusinessFunctionTagIds(
            businessFunctionsTagIds,
            this.rankedCustomJobsRepo.USER_SB_BUSINESS_FUNCTIONS
         )
      this.addResults(jobs)

      return this
   }

   public userFollowingCompanies() {
      if (!this.userProfile?.followingCompanies?.length) return this

      const companies =
         this.userProfile.followingCompanies?.map(
            (company) => company?.groupId
         ) ?? []
      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnGroupIds(
         companies,
         this.rankedCustomJobsRepo.USER_FOLLOWING_COMPANIES
      )
      this.addResults(jobs)

      return this
   }

   public userLastViewedJobsLocations() {
      if (!this.userProfile?.jobApplications?.length) return this

      const locations = removeDuplicates(
         this.userProfile.jobApplications
            .map(
               (application) =>
                  application.job?.jobLocation?.map(
                     (location) => location.id
                  ) ?? []
            )
            .flat()
      )
      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnLocations(
         locations,
         this.rankedCustomJobsRepo.USER_LAST_VIEWED_JOBS_LOCATIONS
      )
      this.addResults(jobs)

      return this
   }

   public userLastViewedJobsIndustries() {
      if (!this.userProfile?.jobApplications?.length) return this

      const industries = removeDuplicates(
         this.userProfile.jobApplications
            .map(
               (application) =>
                  application.job?.group?.companyIndustries?.map(
                     (industry) => industry.id
                  ) ?? []
            )
            .flat()
      )
      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnJobIndustries(
         industries,
         this.rankedCustomJobsRepo.USER_LAST_VIEWED_JOBS_INDUSTRIES
      )
      this.addResults(jobs)

      return this
   }

   public userLastRegisteredLivestreamsIndustries() {
      if (!this.userProfile?.registeredLivestreams?.length) return this

      const industries = removeDuplicates(
         this.userProfile.registeredLivestreams
            .map((livestream) => livestream.companyIndustries ?? [])
            .flat()
      )
      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnJobIndustries(
         industries,
         this.rankedCustomJobsRepo.USER_LAST_REGISTERED_LIVESTREAMS_INDUSTRIES
      )
      this.addResults(jobs)

      return this
   }

   public referenceJobBusinessFunctionsTags() {
      if (!this.jobsData?.referenceJob?.businessFunctionsTagIds?.length)
         return this

      const jobs =
         this.rankedCustomJobsRepo.getCustomJobsBusinessFunctionTagIds(
            this.jobsData.referenceJob.businessFunctionsTagIds,
            this.rankedCustomJobsRepo.REFERENCE_JOB_BUSINESS_FUNCTIONS
         )
      this.addResults(jobs)

      return this
   }

   public referenceJobType() {
      if (!this.jobsData?.referenceJob?.jobType) return this

      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnJobTypes(
         [this.jobsData.referenceJob.jobType],
         this.rankedCustomJobsRepo.REFERENCE_JOB_TYPE
      )
      this.addResults(jobs)

      return this
   }

   public referenceJobLocation() {
      if (!this.jobsData?.referenceJob?.jobLocation?.length) return this

      const locations = this.jobsData.referenceJob.jobLocation.map(
         (location) => location.id
      )
      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnLocations(
         locations,
         this.rankedCustomJobsRepo.REFERENCE_JOB_LOCATION
      )
      this.addResults(jobs)

      return this
   }
}
