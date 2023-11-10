import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Firestore } from "firebase-admin/firestore"
import { mapEventsToNotifications } from "../util"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { addDaysDate } from "src/util"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { getStreamsByDate } from "src/lib/livestream"
import { publicSparksNotificationsRepo } from "src/api/repositories"

const createPublicSparksNotifications = (
   upcomingEvents: LivestreamEvent[],
   firestore: Firestore,
   logger: any
) => {
   const bulkWriter = firestore.bulkWriter()

   const notifications: UserSparksNotification[] =
      mapEventsToNotifications(upcomingEvents)

   logger.log(
      `Creating public spark notifications for the groups: ${notifications
         .map((notification) => notification.groupId)
         .join(", ")}`
   )

   const collectionRef = firestore.collection("publicSparksNotifications")

   notifications.forEach((notification) => {
      const docRef = collectionRef.doc(notification.id)
      bulkWriter.set(docRef, notification)
   })
}

const clearPublicSparksNotifications = async (
   firestore: Firestore,
   logger: any
) => {
   const publicSparksNotificationsRef = firestore.collection(
      "publicSparksNotifications"
   )
   const publicSparksNotificationsSnapshot =
      await publicSparksNotificationsRef.get()

   publicSparksNotificationsSnapshot.docs.forEach((doc) => {
      publicSparksNotificationsRef.doc(doc.id).delete()
   })

   logger.log("Cleared publicSparksNotifications collection.")
}

export const handleCreatePublicSparksNotifications = async (
   firestore: Firestore,
   logger: any
) => {
   const startDate = new Date()
   const endDate = addDaysDate(
      new Date(),
      SPARK_CONSTANTS.LIMIT_DAYS_TO_SHOW_SPARK_NOTIFICATIONS
   )
   const bulkWriter = firestore.bulkWriter()

   const upcomingEvents = await getStreamsByDate(startDate, endDate)

   clearPublicSparksNotifications(firestore, logger)
   createPublicSparksNotifications(upcomingEvents, firestore, logger)

   return bulkWriter.close()
}

export const handleEventStartDateChangeTrigger = (
   newValue: LivestreamEvent,
   previousValue: LivestreamEvent,
   groupId: string,
   logger: any
): Promise<void> => {
   const endDate = addDaysDate(
      new Date(),
      SPARK_CONSTANTS.LIMIT_DAYS_TO_SHOW_SPARK_NOTIFICATIONS
   )

   const isConsideredUpcomingEvent = newValue.startDate <= endDate
   const wasConsideredUpcomingEvent = previousValue.startDate <= endDate

   if (isConsideredUpcomingEvent) {
      logger.log(
         `Event ${newValue.id} from ${groupId} has changed its starting date and is now considered an upcoming event. As result, public spark notification associated with this event will be updated`
      )

      const newNotification: UserSparksNotification = {
         id: groupId,
         eventId: newValue.id,
         startDate: newValue.startDate,
         groupId: groupId,
      }

      return publicSparksNotificationsRepo.create(newNotification)
   } else if (wasConsideredUpcomingEvent) {
      logger.log(
         `Event ${newValue.id} from ${groupId} has changed its starting date and is no longer considered an upcoming event. As result, public spark notification associated with this event will be deleted`
      )

      return publicSparksNotificationsRepo.delete(groupId)
   }

   return Promise.resolve()
}
