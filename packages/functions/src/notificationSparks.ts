import functions = require("firebase-functions")
import { onCall } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import * as yup from "yup"
import { string } from "yup"
import { firestore } from "./api/firestoreAdmin"
import config from "./config"
import { handleCreatePublicSparksNotifications } from "./lib/sparks/notifications/publicNotifications"
import {
   handleCreateUsersSparksNotifications,
   removeUserNotificationsAndSyncSparksNotifications,
} from "./lib/sparks/notifications/userNotifications"
import { logAndThrow } from "./lib/validations"
import { withMiddlewares } from "./middlewares-gen2/onCall/middleware"
import {
   dataValidationMiddleware,
   userAuthExistsMiddleware,
} from "./middlewares-gen2/onCall/validations"

const removeNotificationFromUserValidator = yup.object({
   userId: string().required(),
   groupId: string().required(),
})

/**
 * Every day at 9 AM, check all user's sparksFeed and confirms if any of them needs to have an event sparks notification.
 */
export const createSparksFeedEventNotifications = onSchedule(
   {
      schedule: "0 9 * * *",
      timeZone: "Europe/Zurich",
      region: config.region,
      memory: "1GiB",
   },
   async () => {
      await Promise.allSettled([
         handleCreateUsersSparksNotifications(
            firestore,
            functions.logger.log,
            null,
            true
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
         handleCreatePublicSparksNotifications(firestore, functions.logger.log)
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
   }
)

/**
 * To remove a single notification from user
 */
export const removeAndSyncUserSparkNotification = onCall(
   {
      region: config.region,
      memory: "1GiB",
      timeoutSeconds: 60 * 9,
   },
   withMiddlewares(
      [
         dataValidationMiddleware(removeNotificationFromUserValidator),
         userAuthExistsMiddleware(),
      ],
      async (request) => {
         try {
            const { userId, groupId } = request.data as {
               userId: string
               groupId: string
            }
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
               request.auth,
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
      const { userId } = request.data as { userId: string }

      try {
         return handleCreateUsersSparksNotifications(
            firestore,
            functions.logger.log,
            userId,
            true
         )
      } catch (error) {
         logAndThrow(
            "Error during the creation of a single User Sparks Feed event notifications",
            error,
            userId
         )
      }
   }
)
