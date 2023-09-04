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
import { WriteBatch } from "firebase-admin/firestore"
import { LiveStreamEventWithUsersLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"

const removeNotificationFromUserValidator = {
   userId: string().required(),
   groupId: string().required(),
} as const

/**
 * Every day at 9 AM, check all user's sparksFeed and confirms if any of them needs to have an event sparks notification.
 */
export const createSparksFeedEventNotifications = functions
   .region(config.region)
   .https.onCall(async () => {
      // .pubsub.schedule("0 9 * * *")
      // .timeZone("Europe/Zurich")
      // .onRun(async () => {
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
            error
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
               await sparkRepo.removeAndSyncUserSparkNotification(
                  userId,
                  groupId
               )

               // update spark notifications for this user
               return handleCreateSparksNotifications(userId)
            } catch (error) {
               logAndThrow(
                  "Error during removing a single spark notification from a user",
                  error,
                  context
               )
            }
         }
      )
   )

export const removeAndSyncSparksNotifications = async (groupId: string) => {
   await sparkRepo.removeSparkNotification(groupId)
   return handleCreateSparksNotifications()
}

const handleCreateSparksNotifications = async (userId?: string) => {
   const startDate = new Date()
   const endDate = addDaysDate(
      new Date(),
      SPARK_CONSTANTS.LIMIT_DAYS_TO_SHOW_SPARK_NOTIFICATIONS
   )
   let batch = firestore.batch()

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
      batch = createSparkNotificationForSingleUser({
         userId,
         upcomingEvents,
         batch,
      })
      return batch.commit()
   }

   const userSparksFeedMetrics = await sparkRepo.getAllUserSparksFeedMetrics()

   userSparksFeedMetrics.forEach(({ userId }) => {
      batch = createSparkNotificationForSingleUser({
         userId,
         upcomingEvents,
         batch,
      })
   })

   return batch.commit()
}

type createSparkNotificationForSingleUser = {
   userId: string
   upcomingEvents: LiveStreamEventWithUsersLivestreamData[]
   batch: WriteBatch
}
const createSparkNotificationForSingleUser = ({
   userId,
   upcomingEvents,
   batch,
}: createSparkNotificationForSingleUser): WriteBatch => {
   const notifications: UserSparksNotification[] = []

   // filter all the upcoming events where the user already registered
   const filteredUpcomingEvents = upcomingEvents.filter(
      (event) => !event.registeredUsers?.includes(userId)
   )

   filteredUpcomingEvents.forEach((event) => {
      const {
         author: { groupId },
         id: eventId,
      } = event

      // to check if a notification was already created for this group
      // could happen in case of multiple events from a single group
      // we want to get the first event only
      const groupAlreadyHasNotification = notifications.some(
         (notification) => notification.groupId === groupId
      )

      if (!groupAlreadyHasNotification) {
         notifications.push({
            eventId: eventId,
            groupId: groupId,
            startDate: event.startDate || event.start.toDate(),
         })
      }
   })

   functions.logger.log(
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

      batch.set(userSparksNotificationsRef, notification, { merge: true })
   })

   return batch
}
