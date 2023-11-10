import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { Firestore } from "firebase-admin/firestore"
import { getStreamsByDateWithRegisteredStudents } from "src/lib/livestream"
import { addDaysDate } from "src/util"
import { mapEventsToNotifications } from "../util"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { LiveStreamEventWithUsersLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { sparkRepo } from "src/api/repositories"

type createSparkNotificationForSingleUser = {
   userId: string
   upcomingEvents: LiveStreamEventWithUsersLivestreamData[]
   firestore: Firestore
   logger: any
}

const createSparkNotificationForSingleUser = ({
   userId,
   upcomingEvents,
   firestore,
   logger,
}: createSparkNotificationForSingleUser) => {
   const bulkWriter = firestore.bulkWriter()

   // filter all the upcoming events where the user already registered
   const filteredUpcomingEvents = upcomingEvents.filter(
      (event) => !event.registeredUsers?.includes(userId)
   )

   const notifications: UserSparksNotification[] = mapEventsToNotifications(
      filteredUpcomingEvents
   )

   logger.log(
      `User ${userId} will have spark notifications for the groups: ${notifications
         .map((notification) => notification.groupId)
         .join(", ")}`
   )

   notifications.forEach((notification) => {
      const userSparksNotificationsRef = firestore
         .collection("userData")
         .doc(userId)
         .collection("sparksNotifications")
         .doc(notification.groupId)

      void bulkWriter.set(userSparksNotificationsRef, notification, {
         merge: true,
      })
   })
}

export const handleCreateUsersSparksNotifications = async (
   firestore: Firestore,
   logger: any,
   userId?: string,
   groupId?: string
) => {
   const startDate = new Date()
   const endDate = addDaysDate(
      new Date(),
      SPARK_CONSTANTS.LIMIT_DAYS_TO_SHOW_SPARK_NOTIFICATIONS
   )

   const bulkWriter = firestore.bulkWriter()

   // to get all the upcoming events that will start on the next X days
   const upcomingEventsWithRegisteredStudents =
      await getStreamsByDateWithRegisteredStudents(startDate, endDate)

   logger.log(
      `In next ${SPARK_CONSTANTS.LIMIT_DAYS_TO_SHOW_SPARK_NOTIFICATIONS} days, ${upcomingEventsWithRegisteredStudents.length} events will take place`
   )

   if (userId) {
      // In this case we want only to create notification for a single user
      createSparkNotificationForSingleUser({
         userId,
         upcomingEvents: upcomingEventsWithRegisteredStudents,
         firestore,
         logger,
      })
      return bulkWriter.close()
   }

   const userSparksFeedMetrics = await sparkRepo.getAllUserSparksFeedMetrics()

   userSparksFeedMetrics.forEach(({ userId }) => {
      createSparkNotificationForSingleUser({
         userId,
         upcomingEvents: upcomingEventsWithRegisteredStudents,
         firestore,
         logger,
      })
   })

   return bulkWriter.close()
}

export const removeGroupNotificationsAndSyncSparksNotifications = async (
   firestore: Firestore,
   logger: any,
   groupId: string
) => {
   logger.log(`Removing all spark notifications of group ${groupId}`)
   await sparkRepo.removeAllSparkNotificationsByGroup(groupId)
   return handleCreateUsersSparksNotifications(firestore, logger)
}

export const removeUserNotificationsAndSyncSparksNotifications = async (
   firestore: Firestore,
   logger: any,
   userId: string,
   groupId: string
) => {
   logger.log(
      `Remove spark notification related to the group ${groupId} for the user ${userId}`
   )
   await sparkRepo.removeUserSparkNotification(userId, groupId)
   return handleCreateUsersSparksNotifications(firestore, logger)
}
