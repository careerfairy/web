import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/telemetry"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { FC, useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
   setCardEventNotification,
   setEventNotification,
   setEventToRegisterTo,
   showEventDetailsDialog,
} from "../../../store/reducers/sparksFeedReducer"
import {
   activeSparkSelector,
   cardNotificationSelector,
   currentSparkEventNotificationSelector,
   currentSparkIndexSelector,
   eventDetailsDialogVisibilitySelector,
   eventToRegisterTo,
   groupIdSelector,
   jobToOpen,
   sparksSelector,
} from "../../../store/selectors/sparksFeedSelectors"
import useUserSparksNotifications from "../../custom-hook/spark/useUserSparksNotifications"
import LivestreamDialog, {
   AllDialogSettings,
} from "../livestream-dialog/LivestreamDialog"

type Props = {
   userEmail: string
}
const SparkNotifications: FC<Props> = ({ userEmail }) => {
   const dispatch = useDispatch()

   const { isLoggedIn } = useAuth()

   const currentPlayingIndex = useSelector(currentSparkIndexSelector)
   const sparks = useSelector(sparksSelector)
   const eventNotification = useSelector(currentSparkEventNotificationSelector)
   const eventDetailsDialogVisibility = useSelector(
      eventDetailsDialogVisibilitySelector
   )
   const currentSpark = useSelector(activeSparkSelector)
   const cardNotification = useSelector(cardNotificationSelector)
   const groupId = useSelector(groupIdSelector)
   const eventToRegisterToId = useSelector(eventToRegisterTo)
   const jobToOpenId = useSelector(jobToOpen)
   const { data: eventNotifications } = useUserSparksNotifications(
      userEmail,
      currentSpark?.group.id
   )

   const { trackEvent } = useSparksFeedTracker()

   useEffect(() => {
      if (isLoggedIn && eventToRegisterToId) {
         dispatch(showEventDetailsDialog(true))
      }
   }, [dispatch, isLoggedIn, eventToRegisterToId])

   /**
    * To verify, with each swipe of the carousel, whether there is a notification to the current spark
    * If such a notification exists, update the Redux state with a {SECONDS_TO_SHOW_EVENT_NOTIFICATION}-second timeout for the notification
    */
   useEffect(() => {
      let timeout: NodeJS.Timeout

      if (eventNotifications?.length && !groupId) {
         timeout = setTimeout(() => {
            dispatch(
               setEventNotification(
                  eventNotifications[0] as UserSparksNotification
               )
            )
         }, SPARK_CONSTANTS.SECONDS_TO_SHOW_EVENT_NOTIFICATION)
      }

      return () => {
         clearTimeout(timeout)
      }
   }, [currentPlayingIndex, dispatch, eventNotifications, groupId, sparks])

   /**
    * Enable the card notification when a user navigates from the Company Page
    */
   useEffect(() => {
      if (groupId && eventNotifications?.length) {
         dispatch(
            setCardEventNotification(
               eventNotifications[0] as UserSparksNotification
            )
         )
      }
   }, [groupId, eventNotifications, dispatch])

   const handleCloseDialog = useCallback(() => {
      dispatch(showEventDetailsDialog(false))
      dispatch(setEventToRegisterTo(null))
   }, [dispatch])

   const livestreamId =
      eventNotification?.eventId ||
      cardNotification?.eventId ||
      eventToRegisterToId

   const handleSuccessfulEventRegistration = () => {
      trackEvent(SparkEventActions.Register_Event, {
         livestreamId,
      })
   }

   return eventDetailsDialogVisibility ? (
      <LivestreamDialog
         livestreamId={livestreamId}
         handleClose={handleCloseDialog}
         open={eventDetailsDialogVisibility}
         initialPage={jobToOpenId ? "job-details" : "details"}
         serverUserEmail={userEmail}
         mode={"stand-alone"}
         currentSparkId={currentSpark?.id}
         onRegisterSuccess={handleSuccessfulEventRegistration}
         jobId={jobToOpenId}
         setting={AllDialogSettings.SparksFeed}
      />
   ) : null
}

export default SparkNotifications
