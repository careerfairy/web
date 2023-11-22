import {
   Group,
   GroupOption,
   GroupPhoto,
   GroupPlan,
   GroupQuestion,
   GroupVideo,
   Testimonial,
} from "./groups"
import { GroupATSAccount } from "./GroupATSAccount"
import { UserData } from "../users"
import { IMAGE_CONSTANTS } from "../utils/image"
import { ImageType } from "../commonTypes"
import { PlanConstants, getPlanConstants } from "./planConstants"
import { toDate } from "../firebaseTypes"

export const ATS_MAX_LINKED_ACCOUNTS = 1
export const MAX_GROUP_PHOTOS_COUNT = 15

export const BANNER_IMAGE_SPECS = {
   minWidth: 800,
   minHeight: 172,
   maxWidth: 4300,
   maxHeight: 900,
   // In megabytes
   maxSize: 5, // 5MB
   allowedFormats: IMAGE_CONSTANTS.allowedFormats,
}

export const LOGO_IMAGE_SPECS = {
   minWidth: 100,
   minHeight: 100,
   maxWidth: 2160,
   maxHeight: 2160,
   // In megabytes
   maxSize: 10, // 10MB
   allowedFormats: IMAGE_CONSTANTS.allowedFormats,
}

export class GroupPresenter {
   public atsAccounts: GroupATSAccount[]
   public hasLivestream: boolean

   constructor(
      public readonly id: string,
      public readonly description: string,
      public readonly logoUrl: string,
      public readonly bannerImageUrl: string,
      public readonly extraInfo: string,
      public readonly companyCountry: GroupOption,
      public readonly companyIndustries: GroupOption[],
      public readonly companySize: string,
      public readonly videos: GroupVideo[],
      public readonly photos: GroupPhoto[],
      public readonly testimonials: Testimonial[],
      public readonly publicProfile: boolean,
      public readonly universityName: string,
      public readonly universityCode: string,
      public readonly maxPublicSparks: number,
      public readonly publicSparks: boolean,
      public readonly logo: ImageType,
      public readonly banner: ImageType,
      public readonly planConstants: PlanConstants,
      public readonly plan: {
         type: GroupPlan["type"]
         expiresAt: Date | null
         startedAt: Date | null
      } | null
   ) {}

   setAtsAccounts(accounts: GroupATSAccount[]) {
      this.atsAccounts = accounts
   }

   atsAllowLinkNewAccounts() {
      return this.atsAccounts.length < ATS_MAX_LINKED_ACCOUNTS
   }

   static createFromDocument(group: Group) {
      return new GroupPresenter(
         group.groupId,
         group.description,
         group.logoUrl,
         group.bannerImageUrl,
         group.extraInfo,
         group.companyCountry ?? null,
         group.companyIndustries || [],
         group.companySize ?? null,
         group.videos || [],
         group.photos || [],
         group.testimonials || [],
         group.publicProfile || false,
         group.universityName || null,
         group.universityCode || null,
         group.maxPublicSparks || null,
         group.publicSparks || false,
         group.logo || null,
         group.banner || null,
         getPlanConstants(group.plan?.type),
         createPlanObject(group.plan)
      )
   }

   isUniversity(): boolean {
      return Boolean(this.universityCode)
   }

   isUniversityStudent(user: UserData): boolean {
      return Boolean(
         this.universityCode &&
            user.university &&
            user.university.code === this.universityCode
      )
   }

   getUniversityQuestionsForTable(groupQuestions: GroupQuestion[]) {
      return groupQuestions.map((groupQuestion) => {
         return {
            field: `university.questions.${groupQuestion.id}.answerId`,
            title: groupQuestion.name,
            lookup: Object.keys(groupQuestion.options).reduce((acc, key) => {
               acc[key] = groupQuestion.options[key].name
               return acc
            }, {}),
         }
      })
   }

   getCompanyPageStorageImagePath(photoId: string) {
      return `company-pages/${this.id}/photos/${photoId}`
   }

   getCompanyPageStorageVideoPath(videoId: string) {
      return `company-pages/${this.id}/videos/${videoId}`
   }

   getGroupBannerStorageImagePath(bannerId: string) {
      return `company-pages/${this.id}/banners/${bannerId}`
   }

   setHasLivestream(hasLivestream: boolean) {
      this.hasLivestream = hasLivestream
   }
   companyPageIsReady() {
      return this.getCompanyPageSteps()
         .filter((action) => action.isInitial)
         .every((action) => action.checkIsComplete())
   }

   companyPageIsFullyReady() {
      return this.getCompanyPageSteps().every((action) =>
         action.checkIsComplete()
      )
   }

   hasMinimumData() {
      return Boolean(
         this.extraInfo ||
            this.companyCountry ||
            this.companyIndustries.length ||
            this.companySize
      )
   }

   getCompanyPageSteps() {
      const numAdditionalPhotosRemaining =
         this.photos.length < 6 ? 6 - this.photos.length : 0

      return [
         {
            label: "Add company logo and banner",
            checkIsComplete: () => Boolean(this.logoUrl && this.bannerImageUrl),
            isInitial: true,
            section: "banner",
         },
         {
            label: "Describe your company",
            checkIsComplete: () =>
               Boolean(
                  this.extraInfo &&
                     this.companySize &&
                     this.companyIndustries.length &&
                     this.companyCountry
               ),
            isInitial: true,
            section: "profile",
         },
         {
            label: "Add at least 3 pictures",
            checkIsComplete: () => this.photos.length >= 3,
            isInitial: true,
            section: "photos",
         },
         {
            label: "Upload a video",
            checkIsComplete: () => this.videos.length > 0,
            isInitial: true,
            section: "videos",
         },
         {
            label: "Share an employee’s story",
            checkIsComplete: () => this.testimonials.length > 0,
            isInitial: false,
            section: "testimonials",
         },
         {
            label: "Create a live stream",
            checkIsComplete: () => this.hasLivestream,
            isInitial: false,
            section: "livestreams",
         },
         {
            label: `Add ${numAdditionalPhotosRemaining} more picture${
               numAdditionalPhotosRemaining > 1 ? "s" : ""
            }`,
            checkIsComplete: () => this.photos.length >= 6,
            isInitial: false,
            section: "photos",
         },
      ] as const
   }

   getCompanyPageProgress() {
      const actions = this.getCompanyPageSteps()

      const completedActions = actions.filter((action) =>
         action.checkIsComplete()
      )

      const percentage = Math.round(
         (completedActions.length / actions.length) * 100
      )

      let currentSteps = [...actions]

      const isReady = this.companyPageIsReady()

      if (isReady) {
         currentSteps = currentSteps.filter(
            // Only return the steps that are not completed of the post-initial steps
            (step) => !step.isInitial && !step.checkIsComplete()
         )
      } else {
         currentSteps = currentSteps.filter(
            // Only return the steps that are not completed of the initial steps
            (step) => step.isInitial && !step.checkIsComplete()
         )
      }

      return {
         percentage, // Percentage of the steps that are completed (0-100)
         currentSteps, // Only return the steps that are not completed
         isComplete: percentage === 100, // Whether all the steps are completed
         isReady, // Whether the company page is ready to be viewed by students
      }
   }

   getCompanyPageInitialProgress(): number {
      const initialActions = this.getCompanyPageSteps().filter(
         (action) => action.isInitial
      )

      const completedActions = initialActions.filter((action) =>
         action.checkIsComplete()
      )

      return Math.round((completedActions.length / initialActions.length) * 100)
   }

   /**
    * To get the maximum number of public sparks for this specific group
    * This amount may be different depending on the group agreements
    */
   getMaxPublicSparks() {
      return this.maxPublicSparks || this.planConstants.sparks.MAX_PUBLIC_SPARKS
   }

   /**
    * To get the minimum number of creators required to publish sparks for this specific group
    * This amount may be different depending on the group agreements
    */
   getMinimumCreatorsToPublishSparks() {
      return this.planConstants.sparks.MINIMUM_CREATORS_TO_PUBLISH_SPARKS
   }

   /**
    * To get the minimum number of sparks required per creator to publish sparks for this specific group
    * This amount may be different depending on the group agreements
    */
   getMinimumSparksPerCreatorToPublishSparks() {
      return this.planConstants.sparks
         .MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS
   }

   /**
    * To get the maximum number of creators for this specific group
    * This amount may be different depending on the group agreements
    */
   getMaxSparkCreatorCount() {
      return this.planConstants.sparks.MAX_SPARK_CREATOR_COUNT
   }

   /**
    * To get the duration of the plan for this specific group
    * The duration is calculated from the plan's start and end dates
    */
   getPlanTimeLeft() {
      return this.getExpiresAt() - this.getStartedAt()
   }

   /**
    * To check if the plan for this specific group has expired
    * The check is done by comparing the current time with the plan's expiry time
    */
   hasPlanExpired() {
      const currentTime = new Date().getTime()
      return currentTime > this.getExpiresAt()
   }

   /**
    * To check if the plan for this specific group has started
    * The check is done by comparing the current time with the plan's start time
    *
    * @returns true if the plan has started, false otherwise
    */
   hasPlanStarted() {
      const currentTime = new Date().getTime()
      return currentTime > this.getStartedAt()
   }

   getExpiresAt() {
      return this.plan?.expiresAt?.getTime() || 0
   }

   getStartedAt() {
      return this.plan?.startedAt?.getTime() || 0
   }

   getCompanyLogoUrl() {
      return this.logo ? this.logo.url : this.logoUrl
   }

   getCompanyBannerUrl() {
      return this.banner ? this.banner.url : this.bannerImageUrl
   }
}

const createPlanObject = (plan: GroupPlan | null) => {
   if (plan) {
      return {
         type: plan.type,
         expiresAt: toDate(plan.expiresAt),
         startedAt: toDate(plan.startedAt),
      }
   }
   return null
}
