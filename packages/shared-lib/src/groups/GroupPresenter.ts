import {
   Group,
   GroupOption,
   GroupPhoto,
   GroupQuestion,
   GroupVideo,
   Testimonial,
} from "./groups"
import { GroupATSAccount } from "./GroupATSAccount"
import { UserData } from "../users"

export const ATS_MAX_LINKED_ACCOUNTS = 1
export const MAX_GROUP_PHOTOS_COUNT = 15

export const BANNER_IMAGE_SPECS = {
   minWidth: 864,
   minHeight: 172,
   maxWidth: 4300,
   maxHeight: 900,
   // In megabytes
   maxSize: 5, // 5MB
   allowedFormats: ["jpg", "jpeg", "png", "webp"],
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
      public readonly universityName?: string,
      public readonly universityCode?: string
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
         group.universityName,
         group.universityCode
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
}
