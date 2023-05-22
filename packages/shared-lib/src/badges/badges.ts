import { UserStats } from "../users"

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
   progress(userStats: UserStats): number {
      const sum = this.requirements.reduce(
         (acc, cur) => acc + cur.progress(userStats),
         0
      )
      return Math.round(sum / this.requirements.length)
   }

   /**
    * Check if the badge has all requirements met
    *
    * @param userData
    * @param userStats
    */
   isComplete(userStats: UserStats): boolean {
      return this.requirements.every((r) => r.isComplete(userStats))
   }

   /**
    * Links the two badges in a bidirectional linked list
    * @param badge
    */
   setNextBadge(badge: Badge) {
      this.next = badge
      badge.prev = this
   }

   /**
    * Get all the rewards for this badge chain
    */
   getAllRewards(): string[] {
      const res: string[] = [...this.rewardsDescription]

      let curr: Badge = this.prev
      while (curr) {
         const items = [...curr.rewardsDescription]
         items.forEach((item) => res.push(item))

         curr = curr.prev
      }

      return res
   }

   /**
    * Convert the linked list of badges to an array
    */
   getBadgesArray(): Badge[] {
      const badges: Badge[] = [this]

      let curr: Badge = this.next
      while (curr) {
         badges.push(curr)
         curr = curr.next
      }

      return badges
   }
}

export interface Requirement {
   description: string
   isComplete: (userStats: UserStats) => boolean
   progress: (userStats: UserStats) => number
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

export const DEFAULT_REWARDS = ["A cool badge!"]
