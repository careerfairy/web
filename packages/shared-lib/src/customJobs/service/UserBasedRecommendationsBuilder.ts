import { DateTime } from "luxon"
import { getLocationId, inLocation } from "../../countries/types"
import { LivestreamEvent } from "../../livestreams/livestreams"
import {
   CompanyFollowed,
   StudyBackground,
   UserData,
   UserLastViewedJob,
} from "../../users/users"
import { removeDuplicates } from "../../utils"
import { RecommendationsBuilder } from "../RecommendationsBuilder"
import { CustomJob, CustomJobApplicant, CustomJobStats } from "../customJobs"
import { RankedCustomJobsRepository } from "./RankedCustomJobsRepository"
/**
 * Should hold only basic information about the job and
 * not references to other entities.
 */
export type CustomJobInfo = {
   linkedUpcomingEventsCount: number
}

export type UserProfile = {
   userData: UserData | null
   jobApplications: CustomJobApplicant[]
   registeredLivestreams: LivestreamEvent[]
   studyBackgrounds: StudyBackground[]
   followingCompanies: CompanyFollowed[]
   lastViewedJobs: UserLastViewedJob[]
   savedJobs: CustomJob[]
}

export type JobStats = Record<string, CustomJobStats>

export type JobsInfo = Record<string, CustomJobInfo>

export type JobsData = {
   customJobs: CustomJob[]
   referenceJob: CustomJob | null
   stats: JobStats | null
   jobsInfo?: JobsInfo | null
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

      // Filter jobs by countries of interest, taking into account the state and city
      // Multiplier is the number of countries of interest that match the job location
      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnCondition(
         (job) =>
            this.userProfile.userData.countriesOfInterest.some(
               (country) =>
                  inLocation(
                     country,
                     job.model.jobLocation?.map((location) => location.id)
                  )?.length > 0
            ),
         this.rankedCustomJobsRepo.USER_COUNTRIES_OF_INTEREST,
         (job) =>
            this.userProfile.userData.countriesOfInterest
               .map(
                  (country) =>
                     inLocation(
                        country,
                        job.model.jobLocation?.map((location) => location.id)
                     )?.length
               )
               .reduce((acc, curr) => acc + curr, 0)
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

      if (!location?.length) return this

      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnCondition(
         (job) =>
            inLocation(
               location,
               job.model.jobLocation?.map((location) => location.id)
            )?.length > 0,
         this.rankedCustomJobsRepo.USER_JOB_LOCATION,
         (job) =>
            inLocation(
               location,
               job.model.jobLocation?.map((location) => location.id)
            )?.length
      )

      this.addResults(jobs)

      return this
   }

   public userSavedJobs() {
      if (!this.userProfile?.savedJobs?.length) return this

      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnCondition(
         (job) =>
            this.userProfile.savedJobs.some(
               (savedJob) => savedJob.id === job.model.id
            ),
         this.rankedCustomJobsRepo.USER_SAVED_JOBS
      )

      this.addResults(jobs)

      return this
   }

   public userBusinessFunctionsTags() {
      if (!this.userProfile?.userData?.businessFunctionsTagIds?.length)
         return this

      const jobs =
         this.rankedCustomJobsRepo.getCustomJobsBasedOnBusinessFunctionTagIds(
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
         this.rankedCustomJobsRepo.getCustomJobsBasedOnBusinessFunctionTagIds(
            tags,
            this.rankedCustomJobsRepo.USER_APPLIED_JOBS_BUSINESS_FUNCTIONS
         )

      this.addResults(jobs)

      return this
   }

   public userLastViewedJobsBusinessFunctionsTags() {
      if (!this.userProfile?.lastViewedJobs?.length) return this

      const tags = removeDuplicates(
         this.userProfile.lastViewedJobs
            .map(
               (lastViewedJob) =>
                  lastViewedJob.job?.businessFunctionsTagIds ?? []
            )
            .flat()
      )

      const jobs =
         this.rankedCustomJobsRepo.getCustomJobsBasedOnBusinessFunctionTagIds(
            tags,
            this.rankedCustomJobsRepo.USER_LAST_VIEWED_JOBS_BUSINESS_FUNCTIONS
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
      if (!this.userProfile?.lastViewedJobs?.length) return this

      const locations = removeDuplicates(
         this.userProfile.lastViewedJobs
            .map(
               (lastViewedJob) =>
                  lastViewedJob.job?.jobLocation?.map(
                     (location) => location.id
                  ) ?? []
            )
            .flat()
      )

      if (!locations.length) return this

      // Not applying multiplier for multiple locations
      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnCondition(
         (job) =>
            locations
               .map(
                  (location) =>
                     inLocation(
                        location,
                        job.model.jobLocation?.map((location) => location.id)
                     )?.length > 0
               )
               .some(Boolean),
         this.rankedCustomJobsRepo.USER_LAST_VIEWED_JOBS_LOCATIONS
      )

      this.addResults(jobs)

      return this
   }

   public userLastViewedJobsIndustries() {
      if (!this.userProfile?.lastViewedJobs?.length) return this

      const industries = removeDuplicates(
         this.userProfile.lastViewedJobs
            .map(
               (lastViewedJob) =>
                  lastViewedJob.job?.group?.companyIndustries?.map(
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
         this.rankedCustomJobsRepo.getCustomJobsBasedOnBusinessFunctionTagIds(
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

      if (!locations.length) return this

      // Filter jobs by reference job location, taking into account the state and city
      // Multiplier is the number of reference job locations that match the job location
      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnCondition(
         (job) =>
            locations
               .map(
                  (location) =>
                     inLocation(
                        location,
                        job.model.jobLocation?.map((location) => location.id)
                     )?.length > 0
               )
               .some(Boolean),
         this.rankedCustomJobsRepo.REFERENCE_JOB_LOCATION,
         (job) =>
            locations
               .map(
                  (location) =>
                     inLocation(
                        location,
                        job.model.jobLocation?.map((location) => location.id)
                     )?.length
               )
               .reduce((acc, curr) => acc + curr, 0)
      )

      this.addResults(jobs)

      return this
   }

   public jobLinkedUpcomingEventsCount() {
      if (!this.jobsData?.jobsInfo) return this

      const jobs = this.rankedCustomJobsRepo.getCustomJobsBasedOnCondition(
         (job) =>
            this.jobsData.jobsInfo?.[job.model.id]?.linkedUpcomingEventsCount >
            0,
         this.rankedCustomJobsRepo.JOB_LINKED_UPCOMING_EVENTS_COUNT
      )

      this.addResults(jobs)

      return this
   }

   public jobDeadline() {
      const oneWeekFromNow = DateTime.now().plus({ weeks: 1 })
      const twoWeeksFromNow = DateTime.now().plus({ weeks: 2 })
      const oneMonthFromNow = DateTime.now().plus({ months: 1 })

      const oneWeekFromNowJobs =
         this.rankedCustomJobsRepo.getCustomJobsBasedOnCondition(
            (job) =>
               job.model.deadline &&
               job.model.deadline.toDate() < oneWeekFromNow.toJSDate(),
            this.rankedCustomJobsRepo.JOB_DEADLINE_ONE_WEEK
         )

      const twoWeeksFromNowJobs =
         this.rankedCustomJobsRepo.getCustomJobsBasedOnCondition(
            (job) =>
               job.model.deadline &&
               job.model.deadline.toDate() < twoWeeksFromNow.toJSDate() &&
               job.model.deadline.toDate() > oneWeekFromNow.toJSDate(),
            this.rankedCustomJobsRepo.JOB_DEADLINE_TWO_WEEKS
         )

      const oneMonthFromNowJobs =
         this.rankedCustomJobsRepo.getCustomJobsBasedOnCondition(
            (job) =>
               job.model.deadline &&
               job.model.deadline.toDate() < oneMonthFromNow.toJSDate() &&
               job.model.deadline.toDate() > twoWeeksFromNow.toJSDate(),
            this.rankedCustomJobsRepo.JOB_DEADLINE_ONE_MONTH
         )

      const jobs = [
         ...oneWeekFromNowJobs,
         ...twoWeeksFromNowJobs,
         ...oneMonthFromNowJobs,
      ]

      this.addResults(jobs)

      return this
   }
}
