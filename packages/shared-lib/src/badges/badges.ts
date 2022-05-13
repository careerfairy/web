import { UserData, UserStats } from "../users"

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
export class Badge {
   public next?: Badge
   public prev?: Badge

   constructor(
      public readonly key: string,
      public readonly name: string,
      public readonly level: number, // 1, 2, 3, etc
      public readonly requirements: Requirement[],
      public readonly rewardsDescription: string[]
   ) {}

   /**
    * Total average progress of all requirements
    */
   progress(userData: UserData, userStats: UserStats): number {
      const sum = this.requirements.reduce(
         (acc, cur) => acc + cur.progress(userData, userStats),
         0
      )
      return Math.round(sum / this.requirements.length)
   }

   /**
    * Check if the badge has all requirements met
    * The previous badge must be complete too
    *
    * @param userData
    * @param userStats
    */
   isComplete(userData: UserData, userStats: UserStats): boolean {
      const prevBadgeComplete = this.prev
         ? this.prev.isComplete(userData, userStats)
         : true

      if (!prevBadgeComplete) {
         return false
      }

      return this.requirements.every((r) => r.isComplete(userData, userStats))
   }

   /**
    * Links the two badges in a bidirectional linked list
    * @param badge
    */
   setNextBadge(badge: Badge) {
      this.next = badge
      badge.prev = this
   }
}

export interface Requirement {
   description: string
   isComplete: (userData: UserData, userStats: UserStats) => boolean
   progress: (userData: UserData, userStats: UserStats) => number
}

/**
 * Calculate the % progress of a field considering a target value
 *
 * @param fieldValue
 * @param targetNumber
 */
export const calculateProgressForNumericField = (
   fieldValue: number | undefined | null,
   targetNumber: number
): number => {
   let res = 0

   if (fieldValue) {
      if (fieldValue >= targetNumber) {
         res = 100
      } else {
         res = Math.round((fieldValue / targetNumber) * 100)
      }
   }

   return res
}
