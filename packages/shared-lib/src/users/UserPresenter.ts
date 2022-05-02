import { UserData } from "./users"
import { Badge } from "../badges"
import BasePresenter from "../BasePresenter"
import { getUserBadges, UserBadges } from "./UserBadges"
import { ResearchBadge } from "../badges/ResearchBadges"

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
    * Save Recruiters functionality
    *
    * User requires to have at least level 1 research badge
    */
   canSaveRecruiters(): boolean {
      // any research badge is enough
      return !!this.badges.researchBadge()
   }

   saveRecruitersRequiredBadge(): Badge {
      return ResearchBadge
   }
}
