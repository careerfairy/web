import { ImageType } from "../commonTypes"
import { IFeatureFlagsConsumer } from "../feature-flags/IFeatureFlagsConsumer"
import { FeatureFlagsState } from "../feature-flags/types"
import { FieldOfStudyCategoryMap } from "../fieldOfStudy"
import { toDate } from "../firebaseTypes"
import { UserData } from "../users"
import { IMAGE_CONSTANTS } from "../utils/image"
import { GroupATSAccount } from "./GroupATSAccount"
import {
   FeaturedGroup,
   Group,
   GroupOption,
   GroupPhoto,
   GroupPlan,
   GroupPlanType,
   GroupPlanTypes,
   GroupQuestion,
   GroupVideo,
   Testimonial,
} from "./groups"
import {
   PLAN_CONSTANTS,
   PlanConstants,
   getPlanConstants,
} from "./planConstants"

export const ATS_MAX_LINKED_ACCOUNTS = 1
export const MAX_GROUP_PHOTOS_COUNT = 15
const DAYS_LEFT_TO_WARN_CONTENT_CREATION = 3
const DAYS_LEFT_TO_WARN_TRIAL = 14

const creationDuration =
   PLAN_CONSTANTS.trial.sparks.TRIAL_CREATION_PERIOD_MILLISECONDS

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

export class GroupPresenter implements IFeatureFlagsConsumer {
   public atsAccounts: GroupATSAccount[]
   public hasLivestream: boolean
   public featureFlags: FeatureFlagsState
   public hasMentors: boolean

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
      } | null,
      public readonly featured: FeaturedGroup
   ) {}

   setFeatureFlags(featureFlags: FeatureFlagsState): void {
      this.featureFlags = featureFlags
   }

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
         createPlanObject(group.plan),
         group.featured
      )
   }

   isFeaturedGroup(): boolean {
      return Boolean(
         this.featured?.targetAudience?.length &&
            this.featured?.targetCountries?.length
      )
   }

   /**
    * Could be useful.
    *
    *
    * Determines if the group is featured for a specific user.
    * @param user The user to check if the group is featured for
    * @returns true if the group is featured for the user, false otherwise
    */
   isFeaturedGroupForUser(user: UserData): boolean {
      return (
         this.isFeaturedGroup() &&
         this.featured?.targetAudience?.includes(
            FieldOfStudyCategoryMap[user?.fieldOfStudy?.id]
         )
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

   setHasMentor(hasMentors: boolean) {
      this.hasMentors = hasMentors
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
            label: "Add company logo and banner (recommended size: 2880x57px)",
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
            isInitial: false,
            section: "videos",
         },
         ...(this.featureFlags?.mentorsV1
            ? [
                 {
                    label: "Add a mentor",
                    checkIsComplete: () => this.hasMentors,
                    isInitial: false,
                    section: "mentors",
                 },
              ]
            : [
                 {
                    label: "Share an employee’s story",
                    checkIsComplete: () => this.testimonials.length > 0,
                    isInitial: false,
                    section: "testimonials",
                 },
              ]),
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
    * Determines if the group has reached the maximum number of public sparks based on the current
    * group plan.
    * @param publicSparksCount Current public sparks count
    * @returns boolean indicating whether the maximum number of publishable sparks has been reached
    */
   hasReachedMaxSparks(publicSparksCount: number) {
      return publicSparksCount >= this.getMaxPublicSparks()
   }

   /**
    * Determines if the current group's plan encompasses unlimited sparks
    * @returns boolean indicating whether the group has unlimited sparks or not
    */
   hasUnlimitedSparks() {
      return this.plan?.type == GroupPlanTypes.Tier3
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
      return this.getExpiresAt() - Date.now()
   }

   /**
    * To get the number of days left for this specific group's plan
    */
   getPlanDaysLeft() {
      return getDaysLeft(this.getPlanTimeLeft())
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
    * To check if the plan for this specific group is valid and is
    * of any of the specified @type GroupPlanTypes. Meaning the plan has not expired
    * and his of one of the specified types.
    */
   isPlanValidByTypes(types: GroupPlanType[]) {
      if (!types || !types.length) return this.hasPlanExpired()
      const hasType = types.includes(this.plan?.type)
      return hasType && !this.hasPlanExpired()
   }

   /**
    * To check if the plan for this specific group exists
    *
    * @returns true if the plan exists, false otherwise
    */
   hasPlan() {
      return this.plan !== null && this.plan !== undefined
   }

   isTrialPlan() {
      return this.plan?.type === GroupPlanTypes.Trial
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

   /**
    * Determines whether the present group has a non trial plan.
    * @returns boolean if the group has plan other than GroupPlanTypes.Trial
    */
   hasNonTrialPlan() {
      return (
         this.plan?.type == GroupPlanTypes.Tier1 ||
         this.plan?.type == GroupPlanTypes.Tier2 ||
         this.plan?.type == GroupPlanTypes.Tier3
      )
   }

   getExpiresAt() {
      return this.plan?.expiresAt?.getTime() || 0
   }

   getStartedAt() {
      return this.plan?.startedAt?.getTime() || 0
   }

   getTrialContentCreationProgress() {
      const nowTime = Date.now()
      return Math.floor(
         ((nowTime - this.getStartedAt()) / creationDuration) * 100
      )
   }

   getContentCreationEndTime() {
      return this.getStartedAt() + creationDuration
   }

   getProgressAfterContentCreation() {
      const nowTime = Date.now()
      const contentCreationEndTime = this.getContentCreationEndTime()
      const expiresAt = this.getExpiresAt()

      // If the content creation end time is equal to or later than the expiration time,
      // return 0 to indicate that no time remains for the remainder period.
      // This scenario should not normally occur and could indicate a logical error.
      if (contentCreationEndTime >= expiresAt) {
         return 0
      }

      const remainder = Math.floor(
         ((nowTime - contentCreationEndTime) /
            (expiresAt - contentCreationEndTime)) *
            100
      )

      return remainder < 0 ? 0 : remainder
   }

   getIsInContentCreationPeriod() {
      const nowTime = Date.now()
      const contentCreationEndTime = this.getContentCreationEndTime()
      const expiresAt = this.getExpiresAt()

      return nowTime < contentCreationEndTime && nowTime < expiresAt
   }

   getRemainingDaysLeftForContentCreation() {
      if (this.hasPlanExpired()) {
         return 0
      }

      const nowTime = Date.now()
      const contentCreationEndTime = this.getContentCreationEndTime()
      const expiresAt = this.getExpiresAt()

      // If the content creation end time is later than the expiration time,
      // use the expiration time as the end of the content creation period.
      const effectiveEndTime = Math.min(contentCreationEndTime, expiresAt)

      const remainingTime = effectiveEndTime - nowTime
      return getDaysLeft(remainingTime)
   }

   getContentCreationAboutToExpire() {
      const daysLeft = this.getRemainingDaysLeftForContentCreation()

      if (daysLeft === 0) {
         return false // Don't show warning on the last day
      }

      return daysLeft <= DAYS_LEFT_TO_WARN_CONTENT_CREATION
   }

   getTrialAboutToExpire() {
      const daysLeft = this.getPlanDaysLeft()

      if (daysLeft === 0) {
         return false // Don't show warning on the last day
      }

      return daysLeft <= DAYS_LEFT_TO_WARN_TRIAL
   }

   trialPlanInCriticalState() {
      return (
         this.isTrialPlan() &&
         (this.getTrialAboutToExpire() ||
            this.getContentCreationAboutToExpire() ||
            (!this.getIsInContentCreationPeriod() && !this.publicSparks))
      )
   }

   isTrialPlanContentCreationInCriticalState() {
      const daysLeft = this.getRemainingDaysLeftForContentCreation()

      return (
         !this.hasPlanExpired() &&
         this.isTrialPlan() &&
         daysLeft === DAYS_LEFT_TO_WARN_CONTENT_CREATION &&
         !this.publicSparks
      )
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

const getDaysLeft = (time: number) => {
   const daysLeft = Math.ceil(time / (1000 * 60 * 60 * 24))
   return daysLeft > 0 ? daysLeft : 0
}
