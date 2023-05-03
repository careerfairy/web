import { UserData } from "./users"
import BasePresenter from "../BasePresenter"
import { getUserBadges, UserBadges } from "./UserBadges"
import { Badge } from "../badges/badges"
import { NetworkerBadgeLevel2 } from "../badges/NetworkBadges"
import { EngageBadgeLevel2 } from "../badges/EngageBadges"
import { ResearchBadgeLevel2 } from "../badges/ResearchBadges"

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

   getFieldOfStudyDisplayName(): string {
      const filedOfStudy = this.model?.fieldOfStudy?.name
      return filedOfStudy ? `${filedOfStudy} Student` : null
   }

   getResumePath() {
      return `user_resume/${this.model.authId}.pdf`
   }
}
