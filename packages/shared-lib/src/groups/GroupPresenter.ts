import {
   Group,
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

   constructor(
      public readonly id: string,
      public readonly description: string,
      public readonly logoUrl: string,
      public readonly bannerImageUrl: string,
      public readonly extraInfo: string,
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

   companyPageIsReady() {
      return (
         this.logoUrl &&
         this.bannerImageUrl &&
         this.extraInfo &&
         this.photos.length >= 3 &&
         this.videos.length > 0
      )
   }
}
