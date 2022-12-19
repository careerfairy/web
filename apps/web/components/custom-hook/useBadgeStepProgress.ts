import { useMemo } from "react"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"

const useBadgeStepProgress = (userPresenter: UserPresenter, badge: Badge) => {
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
