import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import { UserStats } from "@careerfairy/shared-lib/dist/users"
import { useMemo } from "react"

type Result = {
   steps: Badge[]
   activeStep: number
   /**
    * The current level of the badge, e.g. 1 for level 1, 2 for level 2 etc.
    * */
   currentBadgeLevel: number
   /*
    * How close you are to completing the entire badge chain (0-100)
    * */
   percentProgress: number
}

/**
 * Returns the steps of a badge, the active step and the percent progress
 * This hook is designed to provide information about the progress a user has made in earning a specific badge.
 *
 * @param userPresenter The user presenter
 * @param userStats The user stats
 * @param badge The badge we wish to get the progress of
 *
 * @returns The total steps of a badge, the currently active step the user is on and the overall percent progress to completion of all the badges in the chain
 * */
const useBadgeStepProgress = (
   badge: Badge,
   userStats?: UserStats,
   userPresenter?: UserPresenter | null
): Result => {
   return useMemo(() => {
      const steps = badge.getBadgesArray()

      const currentBadgeLevel =
         userPresenter?.badges.getCurrentBadgeLevelForBadgeType(badge)

      const percentProgressToNextLevel = currentBadgeLevel?.next
         ? currentBadgeLevel.next.progress(userStats)
         : 0

      const currentLevel = currentBadgeLevel?.level ?? 0

      return {
         steps,
         currentBadgeLevel: currentLevel,
         activeStep: currentBadgeLevel ? currentBadgeLevel.level - 1 : 0,
         percentProgress: Math.round(
            (currentLevel / steps.length) * 100 + // current level
               // Add the % progress to the next level to give a more accurate representation of the overall progress.
               // E.g. if you are on level (1/3) and 50% of the way to level (2/3), then the overall progress is 33.33% + 16.66% = 50% total progress to level (3/3)
               percentProgressToNextLevel / steps.length
         ),
      }
   }, [badge, userPresenter?.badges, userStats])
}

export default useBadgeStepProgress
