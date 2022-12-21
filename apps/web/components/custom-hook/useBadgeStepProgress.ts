import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import { UserStats } from "@careerfairy/shared-lib/dist/users"
import { useMemo } from "react"

type Result = {
   steps: Badge[]
   activeStep: number
   /*
    * How close you are to completing the entire badge chain (0-100)
    * */
   percentProgress: number
}

/**
 * Returns the steps of a badge, the active step and the percent progress
 * This hook is designed to provide information about the progress a user has made in earning a specific badge.
 *
 *
 * @param userPresenter The user presenter
 * @param userStats The user presenter
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
         ? currentBadgeLevel.next.progress(userPresenter.model, userStats)
         : 0

      const activeStep = currentBadgeLevel ? currentBadgeLevel.level : 0

      return {
         steps,
         activeStep,
         percentProgress: Math.round(
            (activeStep / steps.length) * 100 + // current level
               percentProgressToNextLevel / steps.length // Add the % progress to the next level
         ),
      }
   }, [badge, userPresenter.badges, userPresenter.model, userStats])
}

export default useBadgeStepProgress
