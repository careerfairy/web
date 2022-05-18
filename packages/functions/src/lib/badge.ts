import {
   NetworkerBadge,
   NetworkerBadgeLevel2,
   NetworkerBadgeLevel3,
} from "@careerfairy/shared-lib/dist/badges/NetworkBadges"
import functions = require("firebase-functions")
import { userGetByEmail, userUpdateFields } from "./user"
import {
   ResearchBadge,
   ResearchBadgeLevel2,
   ResearchBadgeLevel3,
} from "@careerfairy/shared-lib/dist/badges/ResearchBadges"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import {
   EngageBadgeLevel3,
   EngageBadgeLevel2,
   EngageBadge,
} from "@careerfairy/shared-lib/dist/badges/EngageBadges"

/**
 * Applies user badges based on the userData document
 */
export const handleUserNetworkerBadges = async (
   userDataId: string,
   newValue: any
): Promise<void> => {
   if (!newValue.referralsCount) {
      // no point in continuing, to update the Networker badge we need some referrals
      return
   }
   const badges = newValue.badges
   let newBadges

   functions.logger.log(
      `${userDataId} userData is being updated, current badges:`,
      badges
   )

   // Assign Networker badge level 3
   if (isEligibleForBadge(badges, NetworkerBadgeLevel3)) {
      if (
         newValue.referralsCount >= 10 &&
         newValue.totalLivestreamInvites >= 5
      ) {
         newBadges = replaceBadge(badges, NetworkerBadgeLevel3)
      }
   }

   // Assign Networker badge level 2
   if (isEligibleForBadge(badges, NetworkerBadgeLevel2)) {
      if (newValue.referralsCount >= 3) {
         newBadges = replaceBadge(badges, NetworkerBadgeLevel2)
      }
   }

   // Assign Networker badge level 1
   if (isEligibleForBadge(badges, NetworkerBadge)) {
      if (newValue.referralsCount >= 1) {
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
   newValue: any
): Promise<void> => {
   const badges = (await userGetByEmail(userDataId)).badges
   let newBadges

   functions.logger.log(
      `${userDataId} stats are being updated, current badges:`,
      badges
   )

   // Research

   // Assign Research badge level 3
   if (isEligibleForBadge(badges, ResearchBadgeLevel3)) {
      if (newValue.totalLivestreamAttendances >= 10) {
         newBadges = replaceBadge(badges, ResearchBadgeLevel3)
      }
   }

   // Assign Research badge level 2
   if (isEligibleForBadge(badges, ResearchBadgeLevel2)) {
      if (newValue.totalLivestreamAttendances >= 3) {
         newBadges = replaceBadge(badges, ResearchBadgeLevel2)
      }
   }

   // Assign Research badge level 1
   if (isEligibleForBadge(badges, ResearchBadge)) {
      if (newValue.totalLivestreamAttendances >= 1) {
         newBadges = addBadge(badges, ResearchBadge.key)
      }
   }

   // Engage

   // Assign Engage badge level 3
   if (isEligibleForBadge(badges, EngageBadgeLevel3)) {
      if (newValue.totalQuestionsAsked >= 25 && newValue.totalHandRaises >= 3) {
         newBadges = replaceBadge(badges, EngageBadgeLevel3)
      }
   }

   // Assign Engage badge level 2
   if (isEligibleForBadge(badges, EngageBadgeLevel2)) {
      if (newValue.totalQuestionsAsked >= 10 && newValue.totalHandRaises >= 1) {
         newBadges = replaceBadge(badges, EngageBadgeLevel2)
      }
   }

   // Assign Engage badge level 1
   if (isEligibleForBadge(badges, EngageBadge)) {
      // if (newValue.totalQuestionsAsked >= 5) {
      if (newValue.totalQuestionsAsked >= 1) {
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
