import {
   LiveStreamEventWithUsersLivestreamData,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"

/**
 * This function maps events to notifications based on the closest event.
 *
 * For example, given event E1 with groupIds [A, B, C] happening tomorrow, and event E2 with groupIds [B, C] happening in 3 days,
 * the function should return an array containing the following notifications:
 *
 * [
 *    { id: A, eventId: E1, groupId: A, startDate: tomorrow },
 *    { id: B, eventId: E1, groupId: B, startDate: tomorrow },
 *    { id: C, eventId: E1, groupId: C, startDate: tomorrow }
 * ]
 *
 * Note that there are no notifications for E2 because we only consider the closest event.
 */
export const mapEventsToNotifications = (
   events: LiveStreamEventWithUsersLivestreamData[] | LivestreamEvent[]
): UserSparksNotification[] => {
   const notifications: UserSparksNotification[] = []

   events.forEach((event) => {
      if (event.groupIds && event.groupIds.length > 0) {
         const eventId = event.id

         event.groupIds.forEach((groupId) => {
            const groupAlreadyHasNotification = notifications.some(
               (notification) => notification.groupId === groupId
            )

            if (!groupAlreadyHasNotification) {
               notifications.push({
                  id: groupId,
                  eventId: eventId,
                  groupId: groupId,
                  startDate: event.start.toDate(),
               })
            }
         })
      }
   })

   return notifications
}

export const getGroupIdsToBeUpdatedFromChangedEvent = (
   previousEventValue: LiveStreamEventWithUsersLivestreamData | LivestreamEvent,
   newEventValue: LiveStreamEventWithUsersLivestreamData | LivestreamEvent
): string[] => {
   const notifications = mapEventsToNotifications([
      previousEventValue,
      newEventValue,
   ])
   return [
      ...new Set(notifications?.map((notification) => notification.groupId)),
   ]
}
