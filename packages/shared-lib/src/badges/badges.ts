/**
 * Badges are a linked list to allow multiple levels per badge type
 *
 * Examples:
 * Networker (Referrals) -> Networker Level 2 -> Networker Level 3
 * Attender (Attends Livestreams) -> Attender Gold
 *
 * Badge data is stored on a userData.badges[] field, e.g
 * userData.badges = [Networker Level 2, Attender]
 *
 * We store the current badge level of each type in the array
 * from those we can navigate to the prev/next levels
 */
export interface Badge {
   key: string
   name: string
   achievementDescription: string
   progress: (userData) => number // 0 to 100
   next?: Badge
   prev?: Badge
}

// Networker Badges
export const NetworkerBadge: Badge = {
   key: "Networker",
   name: "Networker",
   achievementDescription: "Refer at least 3 friends",
   progress: (userData) => {
      if (!userData.referralsCount) return 0
      if (userData.referralsCount >= 3) return 100
      return Math.round((userData.referralsCount / 3) * 100)
   },
}

// not used atm, just an example
export const NetworkerAdvancedBadge: Badge = {
   key: "NetworkerAdvanced",
   name: "Networker Advanced",
   achievementDescription: "Refer at least 6 friends",
   progress: (userData) => {
      if (!userData.referralsCount) return 0
      if (userData.referralsCount >= 6) return 100
      return Math.round((userData.referralsCount / 6) * 100)
   },
}

// Relations
NetworkerBadge.next = NetworkerAdvancedBadge
NetworkerAdvancedBadge.prev = NetworkerBadge

/**
 * All active Badges
 * These keys are stored in the userData.badges[] field
 */
export const Badges: Record<string, Badge> = {
   [NetworkerBadge.key]: NetworkerBadge,
   [NetworkerAdvancedBadge.key]: NetworkerAdvancedBadge,
}

export type ExistingBadgesKeys = keyof typeof Badges

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

class UserBadges {
   constructor(public readonly badges: Record<ExistingBadgesKeys, Badge>) {}

   networkerBadge() {
      const currentNetworkerLevel = Object.keys(this.badges).find((key) =>
         /^Networker/.test(key)
      )
      return this.badges?.[currentNetworkerLevel]
   }

   hasAnyBadge() {
      return Object.keys(this.badges).length > 0
   }
}
