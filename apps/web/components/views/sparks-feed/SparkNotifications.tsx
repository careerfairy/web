import { useDispatch, useSelector } from "react-redux"
import {
   activeSparkSelector,
   currentSparkEventNotificationSelector,
   currentSparkIndexSelector,
   eventDetailsDialogVisibilitySelector,
   groupIdSelector,
   sparksSelector,
} from "../../../store/selectors/sparksFeedSelectors"
import useUserSparksNotifications from "../../custom-hook/spark/useUserSparksNotifications"
import { FC, useCallback, useEffect } from "react"
import {
   setCurrentEventNotification,
   showEventDetailsDialog,
} from "../../../store/reducers/sparksFeedReducer"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import LivestreamDialog from "../livestream-dialog/LivestreamDialog"

type Props = {
   userEmail: string
}
const SparkNotifications: FC<Props> = ({ userEmail }) => {
   const dispatch = useDispatch()

   const currentPlayingIndex = useSelector(currentSparkIndexSelector)
   const sparks = useSelector(sparksSelector)
   const eventNotification = useSelector(currentSparkEventNotificationSelector)
   const eventDetailsDialogVisibility = useSelector(
      eventDetailsDialogVisibilitySelector
   )
   const currentSpark = useSelector(activeSparkSelector)
   const groupId = useSelector(groupIdSelector)

   const { data: eventNotifications } = useUserSparksNotifications(
      userEmail,
      currentSpark?.group.id
   )

   useEffect(() => {
      let timeout: NodeJS.Timeout

      if (eventNotifications?.length && !groupId) {
         timeout = setTimeout(() => {
            dispatch(
               setCurrentEventNotification(
                  eventNotifications[0] as UserSparksNotification
               )
            )
         }, SPARK_CONSTANTS.SECONDS_TO_SHOW_EVENT_NOTIFICATION)
      }

      return () => {
         clearTimeout(timeout)
      }
   }, [currentPlayingIndex, dispatch, eventNotifications, groupId, sparks])

   const handleCloseDialog = useCallback(() => {
      dispatch(showEventDetailsDialog(false))
   }, [dispatch])

   return eventDetailsDialogVisibility ? (
      <LivestreamDialog
         livestreamId={eventNotification?.eventId}
         handleClose={handleCloseDialog}
         open={eventDetailsDialogVisibility}
         page={"details"}
         serverUserEmail={userEmail}
         mode={"stand-alone"}
         currentSparkId={currentSpark?.id}
      />
   ) : null
}

export default SparkNotifications
