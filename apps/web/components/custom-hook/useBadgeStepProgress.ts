import { useMemo } from "react"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"

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
 * @param badge The badge we wish to get the progress of
 *
 * @returns The total steps of a badge, the currently active step the user is on and the overall percent progress to completion of all the badges in the chain
 * */
const useBadgeStepProgress = (
   userPresenter: UserPresenter,
   badge: Badge
): Result => {
   return useMemo(() => {
      const steps = badge.getBadgesArray()

      const currentBadgeLevel =
         userPresenter.badges?.getCurrentBadgeLevelForBadgeType(badge)

      const activeStep = currentBadgeLevel ? currentBadgeLevel.level - 1 : 0

      return {
         steps,
         activeStep,
         percentProgress: (activeStep / steps.length) * 100,
      }
   }, [badge, userPresenter.badges])
}

export default useBadgeStepProgress
