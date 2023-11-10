import {
   LiveStreamEventWithUsersLivestreamData,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"

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
