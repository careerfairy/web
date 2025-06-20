import { UserData } from "../../users/users"
import { RecommendationsBuilder } from "../RecommendationsBuilder"
import { CustomJob, CustomJobApplicant, CustomJobStats } from "../customJobs"
import { RankedCustomJobsRepository } from "./RankedCustomJobsRepository"

export type UserProfile = {
   userData: UserData | null
   jobApplications: CustomJobApplicant[]
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

      this.results = this.rankedCustomJobsRepo.getRankedCustomJobs()
   }

   public userCountriesOfInterest() {
      if (!this.userProfile?.userData) return this
      return this
   }

   public userBusinessFunctionsTags() {
      // if(!this.userProfile?.userData)
      //     return this

      console.log(
         "🚀 Results before business function tags:",
         this.results.map((job) => job.model.id + " - " + job.points)
      )
      const jobs =
         this.rankedCustomJobsRepo.getCustomJobsBasedOnUserBusinessFunctionTagIds(
            ["Legal"]
         )
      this.addResults(jobs)
      console.log(
         "🚀 Results after business function tags:",
         this.results.map((job) => job.model.id + " - " + job.points)
      )
      return this
   }

   public userAppliedJobsBusinessFunctionsTags() {
      if (!this.userProfile?.jobApplications?.length) return this

      const tags = this.userProfile.jobApplications
         .map((application) => application.job?.businessFunctionsTagIds ?? [])
         .flat()

      const jobs =
         this.rankedCustomJobsRepo.getCustomJobsBasedOnUserAppliedJobsBusinessFunctionTagIds(
            tags
         )
      this.addResults(jobs)

      return this
   }

   public userStudyBackgroundBusinessFunctionsTags() {
      //    this.userAdditionalInfo.studyBackgrounds?.forEach((studyBackground) => {
      //       if (studyBackground.fieldOfStudy?.id) {
      //          // Fetch the top recommended sparks based on the user's field of study
      //          this.addResults(
      //             this.rankedSparkRepo.getSparksBasedOnFieldOfStudies(
      //                [studyBackground.fieldOfStudy.id],
      //                this.limit
      //             )
      //          )
      //       }
      //    })

      return this
   }
}
