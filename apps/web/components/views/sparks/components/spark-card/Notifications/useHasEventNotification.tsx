import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { useAuth } from "HOCs/AuthProvider"
import useLivestream from "components/custom-hook/live-stream/useLivestream"
import { useMemo } from "react"
import { useSelector } from "react-redux"
import {
   activeSparkSelector,
   currentSparkEventNotificationSelector,
   groupIdSelector,
} from "store/selectors/sparksFeedSelectors"

export const useHasEventNotification = (spark: SparkPresenter) => {
   const { authenticatedUser } = useAuth()
   const eventNotification = useSelector(currentSparkEventNotificationSelector)
   const activeSpark = useSelector(activeSparkSelector)
   const groupPageId = useSelector(groupIdSelector)
   const event = useLivestream(eventNotification?.eventId || "none")
   const isUserRegisteredToEvent = event?.data?.registeredUsers?.includes(
      authenticatedUser?.email
   )

   const hasNotification: boolean = useMemo(
      () =>
         Boolean(
            eventNotification &&
               activeSpark &&
               activeSpark.id === spark?.id &&
               !activeSpark.isCardNotification &&
               !groupPageId &&
               !isUserRegisteredToEvent
         ),
      [
         activeSpark,
         eventNotification,
         groupPageId,
         isUserRegisteredToEvent,
         spark?.id,
      ]
   )

   return hasNotification
}
