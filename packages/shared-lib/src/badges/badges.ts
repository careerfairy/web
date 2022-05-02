import { NetworkerAdvancedBadge, NetworkerBadge } from "./NetworkBadges"
import { UserData } from "../users"
import { ResearchBadge } from "./ResearchBadges"

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
   level: number // 1, 2, 3, etc
   achievementDescription: string
   rewardsDescription: string[]
   progress: (userData: UserData) => number // 0 to 100
   next?: Badge
   prev?: Badge
}

/**
 * All active Badges
 * These keys are stored in the userData.badges[] field
 */
export const Badges: Record<string, Badge> = {
   [NetworkerBadge.key]: NetworkerBadge,
   [NetworkerAdvancedBadge.key]: NetworkerAdvancedBadge,
   [ResearchBadge.key]: ResearchBadge,
}

export type ExistingBadgesKeys = keyof typeof Badges

/**
 * Calculate the % progress of a field considering a target value
 *
 * @param fieldValue
 * @param targetNumber
 */
export const calculateProgressForNumericField = (
   fieldValue: number | undefined | null,
   targetNumber: number
) => {
   if (!fieldValue) return 0
   if (fieldValue >= targetNumber) return 100
   return Math.round((fieldValue / targetNumber) * 100)
}
