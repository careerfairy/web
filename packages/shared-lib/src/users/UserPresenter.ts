import { UserData } from "./users"
import BasePresenter from "../BasePresenter"
import { getUserBadges, UserBadges } from "./UserBadges"
import { ResearchBadge } from "../badges/ResearchBadges"
import { Badge } from "../badges/badges"
import { NetworkerBadge } from "../badges/NetworkBadges"

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
    * User requires to have at least level 1 networker badge
    */
   questionsShouldBeHighlighted(): boolean {
      // any networker badge is enough
      return !!this.badges.networkerBadge()
   }

   // static because we might need to display the badge when the user is not logged in
   static questionsHighlightedRequiredBadge(): Badge {
      return NetworkerBadge
   }

   /**
    * Save Recruiters functionality
    *
    * User requires to have at least level 1 research badge
    */
   canSaveRecruiters(): boolean {
      // any research badge is enough
      return !!this.badges.researchBadge()
   }

   static saveRecruitersRequiredBadge(): Badge {
      return ResearchBadge
   }
}
