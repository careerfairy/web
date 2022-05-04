import { NetworkerBadge } from "../badges/NetworkBadges"
import { ResearchBadge } from "../badges/ResearchBadges"
import { Badge } from "../badges/badges"

/**
 * All active Badges
 * These keys are stored in the userData.badges[] field
 */
export const Badges: Record<string, Badge> = {
   [NetworkerBadge.key]: NetworkerBadge,
   [ResearchBadge.key]: ResearchBadge,
}

export type ExistingBadgesKeys = keyof typeof Badges

export class UserBadges {
   constructor(public readonly badges: Record<ExistingBadgesKeys, Badge>) {}

   networkerBadge() {
      const currentNetworkerLevel = Object.keys(this.badges).find((key) =>
         /^Networker/.test(key)
      )
      return this.badges?.[currentNetworkerLevel]
   }

   researchBadge() {
      const currentLevel = Object.keys(this.badges).find((key) =>
         /^Research/.test(key)
      )
      return this.badges?.[currentLevel]
   }

   hasAnyBadge() {
      return Object.keys(this.badges).length > 0
   }
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
