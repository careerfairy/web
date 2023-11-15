import { useDispatch, useSelector } from "react-redux"
import {
   activeSparkSelector,
   cardNotificationSelector,
   currentSparkEventNotificationSelector,
   currentSparkIndexSelector,
   eventDetailsDialogVisibilitySelector,
   groupIdSelector,
   sparksSelector,
   eventToRegisterTo,
} from "../../../store/selectors/sparksFeedSelectors"
import useUserSparksNotifications from "../../custom-hook/spark/useUserSparksNotifications"
import { FC, useCallback, useEffect } from "react"
import {
   setCardNotification,
   setCurrentEventNotification,
   setEventToRegisterTo,
   showEventDetailsDialog,
} from "../../../store/reducers/sparksFeedReducer"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import LivestreamDialog from "../livestream-dialog/LivestreamDialog"
import { useAuth } from "HOCs/AuthProvider"

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
   const { data: eventNotifications } = useUserSparksNotifications(
      userEmail,
      currentSpark?.group.id
   )

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

   /**
    * Enable the card notification when a user navigates from the Company Page
    */
   useEffect(() => {
      if (groupId && eventNotifications?.length) {
         dispatch(
            setCardNotification(eventNotifications[0] as UserSparksNotification)
         )
      }
   }, [groupId, eventNotifications, dispatch])

   const handleCloseDialog = useCallback(() => {
      dispatch(showEventDetailsDialog(false))
      dispatch(setEventToRegisterTo(null))
   }, [dispatch])

   return eventDetailsDialogVisibility ? (
      <LivestreamDialog
         livestreamId={
            eventNotification?.eventId ||
            cardNotification?.eventId ||
            eventToRegisterToId
         }
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
