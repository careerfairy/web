import { Badge } from "../badges/badges"
import { EngageBadgeLevel2 } from "../badges/EngageBadges"
import { NetworkerBadgeLevel2 } from "../badges/NetworkBadges"
import { ResearchBadgeLevel2 } from "../badges/ResearchBadges"
import BasePresenter from "../BasePresenter"
import { IMAGE_CONSTANTS } from "../utils/image"
import { getUserBadges, UserBadges } from "./UserBadges"
import { UserData } from "./users"

export const USER_BANNER_IMAGE_SPECS = {
   minWidth: 320,
   minHeight: 240,
   maxWidth: 5000,
   maxHeight: 3000,
   // In megabytes
   maxSize: 10, // 5MB
   allowedFormats: IMAGE_CONSTANTS.allowedFormats,
}

export const USER_AVATAR_IMAGE_SPECS = {
   minWidth: 240,
   minHeight: 240,
   maxWidth: 5000,
   maxHeight: 5000,
   // In megabytes
   maxSize: 10, // 10MB
   allowedFormats: IMAGE_CONSTANTS.allowedFormats,
}

export default class UserPresenter extends BasePresenter<UserData> {
   public readonly badges: UserBadges

   constructor(public readonly model: UserData) {
      super(model)
      this.badges = getUserBadges(model.badges)
   }

   isAdmin(): boolean {
      return this.model.isAdmin
   }

   /**
    * Highlight Event Questions functionality
    *
    * User requires to have at least level 2 Engage badge
    */
   questionsShouldBeHighlighted(): boolean {
      return this.badges.hasBadgeComplete(
         UserPresenter.questionsHighlightedRequiredBadge()
      )
   }

   // static because we might need to display the badge when the user is not logged in
   static questionsHighlightedRequiredBadge(): Badge {
      return EngageBadgeLevel2
   }

   /**
    * Save Recruiters functionality
    *
    * User requires to have at least level 2 Networker badge
    */
   canSaveRecruiters(): boolean {
      return this.badges.hasBadgeComplete(
         UserPresenter.saveRecruitersRequiredBadge()
      )
   }

   static saveRecruitersRequiredBadge(): Badge {
      return NetworkerBadgeLevel2
   }

   /**
    * Watch Highlights functionality
    *
    * User requires to have at least level 2 Research badge
    */
   canWatchAllHighlights(): boolean {
      return this.badges.hasBadgeComplete(
         UserPresenter.watchAllHighlightsRequiredBadge()
      )
   }

   static watchAllHighlightsRequiredBadge(): Badge {
      return ResearchBadgeLevel2
   }

   getDisplayName(): string {
      return [this.model.firstName, this.model.lastName]
         .filter(Boolean)
         .join(" ")
   }

   getBackground(): string {
      return [this.model.fieldOfStudy?.name, this.model.university?.name]
         .filter(Boolean)
         .join(" - ")
   }

   getFieldOfStudyDisplayName(talentProfileV1?: boolean): string {
      const filedOfStudy = this.model?.fieldOfStudy?.name
      return filedOfStudy
         ? `${filedOfStudy} ${talentProfileV1 ? "" : "Student"}`
         : null
   }

   getResumePath() {
      return `user_resume/${this.model.authId}.pdf`
   }

   hasResume() {
      return Boolean(this.model.userResume?.length > 0)
   }

   shouldSeeWelcomeDialog() {
      // undefined => old users that didn't have the field
      // true => user has seen
      return this.model.welcomeDialogComplete === false
   }

   getUserAvatarImageStoragePath(imageId: string): string {
      return `${this.model.authId}/avatar/${imageId}`
   }

   getUserBannerImageStoragePath(imageId: string): string {
      return `${this.model.authId}/banner/${imageId}`
   }

   userHasInterests(): boolean {
      return Boolean(
         this.model.businessFunctionsTagIds?.length ||
            this.model.contentTopicsTagIds?.length
      )
   }
}
