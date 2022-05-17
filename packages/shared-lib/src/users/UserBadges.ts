import {
   NetworkerBadge,
   NetworkerBadgeLevel2,
   NetworkerBadgeLevel3,
} from "../badges/NetworkBadges"
import {
   ResearchBadge,
   ResearchBadgeLevel2,
   ResearchBadgeLevel3,
} from "../badges/ResearchBadges"
import { Badge } from "../badges/badges"
import {
   EngageBadge,
   EngageBadgeLevel2,
   EngageBadgeLevel3,
} from "../badges/EngageBadges"

/**
 * All active Badges
 * These keys are stored in the userData.badges[] field
 */
export const Badges: Record<string, Badge> = {
   [NetworkerBadge.key]: NetworkerBadge,
   [NetworkerBadgeLevel2.key]: NetworkerBadgeLevel2,
   [NetworkerBadgeLevel3.key]: NetworkerBadgeLevel3,

   [ResearchBadge.key]: ResearchBadge,
   [ResearchBadgeLevel2.key]: ResearchBadgeLevel2,
   [ResearchBadgeLevel3.key]: ResearchBadgeLevel3,

   [EngageBadge.key]: EngageBadge,
   [EngageBadgeLevel2.key]: EngageBadgeLevel2,
   [EngageBadgeLevel3.key]: EngageBadgeLevel3,
}

export type ExistingBadgesKeys = keyof typeof Badges

export class UserBadges {
   constructor(public readonly badges: Record<ExistingBadgesKeys, Badge>) {}

   /**
    * Get current Networker badge for the user
    */
   networkerBadge() {
      return this.badges?.[this.getCurrentBadgeLevelKey("Networker")]
   }

   /**
    * Get current Research badge for the user
    */
   researchBadge() {
      return this.badges?.[this.getCurrentBadgeLevelKey("Research")]
   }

   /**
    * Get current Engage badge for the user
    */
   engageBadge() {
      return this.badges?.[this.getCurrentBadgeLevelKey("Engage")]
   }

   hasAnyBadge() {
      return Object.keys(this.badges).length > 0
   }

   /**
    * Check if the user has this badge
    * If the user is in a more advanced level of this badge, means it has this badge
    * @param badge
    */
   hasBadgeComplete(badge: Badge) {
      if (this.badges?.[badge.key]) {
         // user owns this badge, meaning its complete already
         return true
      }

      // check if the received badge is a previous level of the current user badge
      // if it is, then the badge is complete as well since the user has progressed to the next level
      for (let badgesKey in this.badges) {
         if (getPreviousBadgeBackwardsInChain(Badges[badgesKey], badge.key)) {
            return true
         }
      }

      return false
   }

   /**
    * Find the current badge level for the passed Badge
    * If the user doesn't have that badge type, returns null
    * @param badge
    */
   getCurrentBadgeLevelForBadgeType(badge: Badge) {
      if (this.badges?.[badge.key]) {
         // user current level is the received badge
         return badge
      }

      for (let badgesKey in this.badges) {
         const previousBadge = getPreviousBadgeBackwardsInChain(
            Badges[badgesKey],
            badge.key
         )
         if (previousBadge) {
            return this.badges[badgesKey]
         }
      }

      return null
   }

   private getCurrentBadgeLevelKey(badgeKeyPrefix: string): ExistingBadgesKeys {
      return Object.keys(this.badges).find(
         (badgeKey) => badgeKey.indexOf(badgeKeyPrefix) !== -1
      )
   }
}

function getPreviousBadgeBackwardsInChain(
   badgeChain: Badge,
   badgeKey: string
): Badge {
   if (badgeChain.key === badgeKey) {
      return badgeChain
   }

   let curr = badgeChain.prev
   while (curr) {
      if (curr.key === badgeKey) {
         return curr
      }
      curr = curr.prev
   }

   return null
}

/**
 * Convert a userData.badges[] field (that contains only keys)
 * to an object that contains the Badges objects
 *
 * {[key: ExistingBadgesKeys]: Badge}
 * @param userDataBadgesArray
 */
export const getUserBadges = (userDataBadgesArray: string[]): UserBadges => {
   if (!userDataBadgesArray || userDataBadgesArray.length === 0)
      return new UserBadges({})

   return new UserBadges(
      // convert user badges array to object key -> Badge
      userDataBadgesArray.reduce((acc, curr) => {
         if (Badges[curr]) {
            return { ...acc, [curr]: Badges[curr] }
         } else {
            return acc
         }
      }, {})
   )
}
