import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setShouldShowLinkedInPopUpNotification } from "store/reducers/sparksFeedReducer"
import { shouldShowLinkedInPopUpNotificationSelector } from "store/selectors/sparksFeedSelectors"

export const useLinkedInNotificationStateManagement = () => {
   const dispatch = useDispatch()
   const shouldShowLinkedInCTA = useSelector(
      shouldShowLinkedInPopUpNotificationSelector
   )
   const [prevPercentagePlayed, setPrevPercentagePlayed] = useState(0.0)

   const onSparkPercentagePlayed = useCallback(
      (percentagePlayed: number) => {
         if (shouldShowLinkedInCTA && prevPercentagePlayed > percentagePlayed) {
            setPrevPercentagePlayed(0.0)
            dispatch(setShouldShowLinkedInPopUpNotification(false))
            return
         }

         if (
            !shouldShowLinkedInCTA &&
            percentagePlayed >=
               SPARK_CONSTANTS.PLAYED_PERCENTAGE_TO_SHOW_LINKEDIN_NOTIFICATION
         ) {
            dispatch(setShouldShowLinkedInPopUpNotification(true))
         }
         setPrevPercentagePlayed(percentagePlayed)
      },
      [dispatch, prevPercentagePlayed, shouldShowLinkedInCTA]
   )

   useEffect(() => {
      return () => {
         dispatch(setShouldShowLinkedInPopUpNotification(false))
         setPrevPercentagePlayed(0.0)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   return { onSparkPercentagePlayed }
}
