import functions = require("firebase-functions")
import { RemoveNotificationFromUserData } from "@careerfairy/shared-lib/sparks/sparks"
import { onCall } from "firebase-functions/https"
import { onSchedule } from "firebase-functions/scheduler"
import { string } from "yup"
import { firestore } from "./api/firestoreAdmin"
import { handleCreatePublicSparksNotifications } from "./lib/sparks/notifications/publicNotifications"
import {
   handleCreateUsersSparksNotifications,
   removeUserNotificationsAndSyncSparksNotifications,
} from "./lib/sparks/notifications/userNotifications"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation } from "./middlewares/validations"

const removeNotificationFromUserValidator = {
   userId: string().required(),
   groupId: string().required(),
} as const

/**
 * Runtime settings
 */
const runtimeSettings: functions.GlobalOptions = {
   // we may load some data
   memory: "1GiB",
}

/**
 * Every day at 9 AM, check all user's sparksFeed and confirms if any of them needs to have an event sparks notification.
 */
export const createSparksFeedEventNotifications = onSchedule(
   {
      ...runtimeSettings,
      schedule: "0 9 * * *",
      timeZone: "Europe/Zurich",
   },
   async () => {
      try {
         await Promise.allSettled([
            handleCreateUsersSparksNotifications(
               firestore,
               functions.logger.log
            )
               .then(() => {
                  functions.logger.log(
                     "Finished creating user sparks notifications."
                  )
               })
               .catch((error) => {
                  functions.logger.error(
                     `Failed to create user sparks notifications: ${error}`
                  )
               }),
            handleCreatePublicSparksNotifications(
               firestore,
               functions.logger.log
            )
               .then(() => {
                  functions.logger.log(
                     "Finished creating public sparks notifications."
                  )
               })
               .catch((error) => {
                  functions.logger.error(
                     `Failed to create public sparks notifications: ${error}`
                  )
               }),
         ])
      } catch (error) {
         logAndThrow(
            "Error during the creation of Sparks Feed event notifications",
            error
         )
      }
   }
)

/**
 * To remove a single notification from user
 */
export const removeAndSyncUserSparkNotification = onCall(
   middlewares<RemoveNotificationFromUserData>(
      dataValidation({
         ...removeNotificationFromUserValidator,
      }),
      async (request) => {
         try {
            const { userId, groupId } = request.data
            return removeUserNotificationsAndSyncSparksNotifications(
               firestore,
               functions.logger.log,
               userId,
               groupId
            )
         } catch (error) {
            logAndThrow(
               "Error during removing a single spark notification from a user",
               error,
               request.data
            )
         }
      }
   )
)

/**
 * To create Sparks event notifications to a single User
 */
export const createUserSparksFeedEventNotifications = onCall(
   async (request) => {
      try {
         const userId = request.data
         return handleCreateUsersSparksNotifications(
            firestore,
            functions.logger.log,
            userId
         )
      } catch (error) {
         logAndThrow(
            "Error during the creation of a single User Sparks Feed event notifications",
            error,
            request.data
         )
      }
   }
)
