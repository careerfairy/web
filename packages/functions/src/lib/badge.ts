import {
   NetworkerBadge,
   NetworkerBadgeLevel2,
   NetworkerBadgeLevel3,
} from "@careerfairy/shared-lib/badges/NetworkBadges"
import functions = require("firebase-functions")
import { userUpdateFields } from "./user"
import {
   ResearchBadge,
   ResearchBadgeLevel2,
   ResearchBadgeLevel3,
} from "@careerfairy/shared-lib/badges/ResearchBadges"
import { Badge } from "@careerfairy/shared-lib/badges/badges"
import {
   EngageBadgeLevel3,
   EngageBadgeLevel2,
   EngageBadge,
} from "@careerfairy/shared-lib/badges/EngageBadges"
import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { userRepo } from "../api/repositories"

/**
 * Applies user badges based on the userData document
 */
export const handleUserNetworkerBadges = async (
   userDataId: string,
   newUserData: UserData
): Promise<void> => {
   if (!newUserData.referralsCount) {
      // no point in continuing, to update the Networker badge we need some referrals
      return
   }
   const badges = newUserData.badges || []
   let newBadges

   functions.logger.log(
      `${userDataId} userData is being updated, current badges:`,
      badges
   )

   // Assign Networker badge level 3
   if (isEligibleForBadge(badges, NetworkerBadgeLevel3)) {
      if (NetworkerBadgeLevel3.isComplete(newUserData, null)) {
         newBadges = replaceBadge(badges, NetworkerBadgeLevel3)
      }
   }

   // Assign Networker badge level 2
   if (isEligibleForBadge(badges, NetworkerBadgeLevel2)) {
      if (NetworkerBadgeLevel2.isComplete(newUserData, null)) {
         newBadges = replaceBadge(badges, NetworkerBadgeLevel2)
      }
   }

   // Assign Networker badge level 1
   if (isEligibleForBadge(badges, NetworkerBadge)) {
      if (NetworkerBadge.isComplete(newUserData, null)) {
         newBadges = addBadge(badges, NetworkerBadge.key)
      }
   }

   if (newBadges) {
      await updateUserWithNewBadges(userDataId, newBadges)
   }
}

/**
 * Applies user badges based on the userStats document
 */
export const handleUserStatsBadges = async (
   userDataId: string,
   newUserStats: UserStats
): Promise<void> => {
   const userData: UserData = (await userRepo.getUserDataById(
      userDataId
   )) as UserData
   const badges = userData.badges || []
   let newBadges

   functions.logger.log(
      `${userDataId} stats are being updated, current badges:`,
      badges
   )

   // Research

   // Assign Research badge level 3
   if (isEligibleForBadge(badges, ResearchBadgeLevel3)) {
      if (ResearchBadgeLevel3.isComplete(userData, newUserStats)) {
         newBadges = replaceBadge(badges, ResearchBadgeLevel3)
      }
   }

   // Assign Research badge level 2
   if (isEligibleForBadge(badges, ResearchBadgeLevel2)) {
      if (ResearchBadgeLevel2.isComplete(userData, newUserStats)) {
         newBadges = replaceBadge(badges, ResearchBadgeLevel2)
      }
   }

   // Assign Research badge level 1
   if (isEligibleForBadge(badges, ResearchBadge)) {
      if (ResearchBadge.isComplete(userData, newUserStats)) {
         newBadges = addBadge(badges, ResearchBadge.key)
      }
   }

   // Engage

   // Assign Engage badge level 3
   if (isEligibleForBadge(badges, EngageBadgeLevel3)) {
      if (EngageBadgeLevel3.isComplete(userData, newUserStats)) {
         newBadges = replaceBadge(badges, EngageBadgeLevel3)
      }
   }

   // Assign Engage badge level 2
   if (isEligibleForBadge(badges, EngageBadgeLevel2)) {
      if (EngageBadgeLevel2.isComplete(userData, newUserStats)) {
         newBadges = replaceBadge(badges, EngageBadgeLevel2)
      }
   }

   // Assign Engage badge level 1
   if (isEligibleForBadge(badges, EngageBadge)) {
      if (EngageBadge.isComplete(userData, newUserStats)) {
         newBadges = addBadge(badges, EngageBadge.key)
      }
   }

   if (newBadges) {
      await updateUserWithNewBadges(userDataId, newBadges)
   }
}

const isEligibleForBadge = (badges: string[], badge: Badge): boolean => {
   if (badge.prev) {
      return (
         doesNotHaveBadge(badges, badge.key) &&
         haveBadge(badges, badge.prev.key)
      )
   } else {
      return (
         doesNotHaveBadge(badges, badge.key) &&
         doesNotHaveBadgeOfType(badges, badge.key)
      )
   }
}

const updateUserWithNewBadges = async (userDataId, newBadges: string[]) => {
   await userUpdateFields(userDataId, {
      badges: newBadges,
   })
   functions.logger.log(
      `${userDataId} was rewarded a new badge! Current badges: ${newBadges.join(
         ", "
      )}.`
   )
}

const haveBadge = (badges: string[], badgeKey: string): boolean => {
   return badges?.includes(badgeKey)
}

const doesNotHaveBadge = (badges: string[], badgeKey: string): boolean => {
   return !badges?.includes(badgeKey)
}

/**
 * Check if there is a different badge of the same type
 *
 * e.g Research exists in [Research3]
 * @param badges
 * @param badgeKeyType
 */
const doesNotHaveBadgeOfType = (
   badges: string[],
   badgeKeyType: string
): boolean => {
   for (const badge of badges) {
      if (badge.indexOf(badgeKeyType) > -1) {
         return false
      }
   }

   return true
}

const addBadge = (badges: string[], newBadgeKey: string) => {
   const res = badges ? [...badges] : []
   if (!res.includes(newBadgeKey)) {
      res.push(newBadgeKey)
   }

   return res
}

const replaceBadge = (badges: string[], newBadge: Badge) => {
   const res = [...badges]
   const index = res.indexOf(newBadge.prev.key)
   if (index > -1) {
      res.splice(index, 1, newBadge.key)
   }

   return res
}
