import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { useCallback, useState } from "react"

export const useLinkedInNotificationStateManagement = () => {
   const [shouldShowLinkedInCTA, setShouldShowLinkedInCTA] = useState(false)

   const onSparkPercentagePlayed = useCallback(
      (percentagePlayed: number) => {
         if (
            !shouldShowLinkedInCTA &&
            percentagePlayed >=
               SPARK_CONSTANTS.PLAYED_PERCENTAGE_TO_SHOW_LINKEDIN_NOTIFICATION
         ) {
            setShouldShowLinkedInCTA(true)
         }
      },
      [shouldShowLinkedInCTA]
   )

   return {
      shouldShowLinkedInCTA,
      onSparkPercentagePlayed,
   }
}
