import functions = require("firebase-functions")
import { RemoveNotificationFromUserData } from "@careerfairy/shared-lib/sparks/sparks"
import { string } from "yup"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation } from "./middlewares/validations"
import {
   handleCreateUsersSparksNotifications,
   removeUserNotificationsAndSyncSparksNotifications,
} from "./lib/sparks/notifications/userNotifications"
import { handleCreatePublicSparksNotifications } from "./lib/sparks/notifications/publicNotifications"
import { firestore } from "./api/firestoreAdmin"

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
         return Promise.allSettled([
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
                  context,
                  data
               )
            }
         }
      )
   )

/**
 * To create Sparks event notifications to a single User
 */
export const createUserSparksFeedEventNotifications = functions
   .region(config.region)
   .https.onCall(async (userId) => {
      try {
         return handleCreateUsersSparksNotifications(
            firestore,
            functions.logger.log,
            userId
         )
      } catch (error) {
         logAndThrow(
            "Error during the creation of a single User Sparks Feed event notifications",
            error,
            userId
         )
      }
   })
