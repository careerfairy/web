import functions = require("firebase-functions")
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { RemoveNotificationFromUserData } from "@careerfairy/shared-lib/sparks/sparks"
import { string } from "yup"
import { sparkRepo } from "./api/repositories"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation } from "./middlewares/validations"
import { addDaysDate } from "./util"
import { firestore } from "./api/firestoreAdmin"
import { getStreamsByDateWithRegisteredStudents } from "./lib/livestream"
import { LiveStreamEventWithUsersLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { BulkWriter } from "firebase-admin/firestore"

const removeNotificationFromUserValidator = {
   userId: string().required(),
   groupId: string().required(),
} as const

/**
 * Every day at 9 AM, check all user's sparksFeed and confirms if any of them needs to have an event sparks notification.
 */
export const createSparksFeedEventNotifications = functions
   .region(config.region)
   .pubsub.schedule("0 9 * * *")
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      try {
         return handleCreateSparksNotifications()
      } catch (error) {
         logAndThrow(
            "Error during the creation of Users Sparks Feed event notifications",
            error
         )
      }
   })

/**
 * To create Sparks event notifications to a single User
 */
export const createUserSparksFeedEventNotifications = functions
   .region(config.region)
   .https.onCall(async (userId) => {
      try {
         return handleCreateSparksNotifications(userId)
      } catch (error) {
         logAndThrow(
            "Error during the creation of a single User Sparks Feed event notifications",
            error,
            userId
         )
      }
   })

/**
 * To remove a single notification from user
 */
export const removeAndSyncUserSparkNotification = functions
   .region(config.region)
   .https.onCall(
      middlewares(
         dataValidation({
            ...removeNotificationFromUserValidator,
         }),
         async (data: RemoveNotificationFromUserData, context) => {
            try {
               const { userId, groupId } = data

               functions.logger.log(
                  `remove spark notification related to the group ${groupId} for the user ${userId}`
               )
               // remove single notification for this particular user
               await sparkRepo.removeUserSparkNotification(userId, groupId)

               // update spark notifications for this user
               return handleCreateSparksNotifications(userId)
            } catch (error) {
               logAndThrow(
                  "Error during removing a single spark notification from a user",
                  error,
                  context,
                  data
               )
            }
         }
      )
   )

export const removeAndSyncSparksNotifications = async (groupId: string) => {
   await sparkRepo.removeSparkNotification(groupId)
   return handleCreateSparksNotifications()
}

export const syncUserSparksNotifications = async (userId: string) => {
   return handleCreateSparksNotifications(userId)
}

const handleCreateSparksNotifications = async (userId?: string) => {
   const startDate = new Date()
   const endDate = addDaysDate(
      new Date(),
      SPARK_CONSTANTS.LIMIT_DAYS_TO_SHOW_SPARK_NOTIFICATIONS
   )
   const bulkWriter = firestore.bulkWriter()

   // to get all the upcoming events that will start on the next X days
   const upcomingEvents = await getStreamsByDateWithRegisteredStudents(
      startDate,
      endDate
   )

   functions.logger.log(
      `In next ${SPARK_CONSTANTS.LIMIT_DAYS_TO_SHOW_SPARK_NOTIFICATIONS} days, ${upcomingEvents.length} events will take place`
   )

   if (userId) {
      // In this case we want only to create notification for a single user
      createSparkNotificationForSingleUser({
         userId,
         upcomingEvents,
         bulkWriter,
      })
      return bulkWriter.close()
   }

   const userSparksFeedMetrics = await sparkRepo.getAllUserSparksFeedMetrics()

   userSparksFeedMetrics.forEach(({ userId }) => {
      createSparkNotificationForSingleUser({
         userId,
         upcomingEvents,
         bulkWriter,
      })
   })

   return bulkWriter.close()
}

type createSparkNotificationForSingleUser = {
   userId: string
   upcomingEvents: LiveStreamEventWithUsersLivestreamData[]
   bulkWriter: BulkWriter
}
const createSparkNotificationForSingleUser = ({
   userId,
   upcomingEvents,
   bulkWriter,
}: createSparkNotificationForSingleUser) => {
   const notifications: UserSparksNotification[] = []

   // filter all the upcoming events where the user already registered
   const filteredUpcomingEvents = upcomingEvents.filter(
      (event) => !event.registeredUsers?.includes(userId)
   )

   filteredUpcomingEvents.forEach((event) => {
      // Check if groupIds array exists and is not empty
      if (event.groupIds && event.groupIds.length > 0) {
         const eventId = event.id

         event.groupIds.forEach((groupId) => {
            // to check if a notification was already created for this group
            // could happen in case of multiple events from a single group
            // we want to get the first event only
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

   functions.logger.log(
      `User ${userId} will have spark notifications for the groups: ${notifications
         .map((notification) => notification.groupId)
         .join(", ")}`
   )

   console.log(
      "🚀 ~ file: notificationSparks.ts:200 ~ notifications.forEach ~ notifications:",
      notifications
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
