import functions = require("firebase-functions")
import { string, number } from "yup"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { sparkRepo } from "./api/repositories"

import { dataValidation, userAuthExists } from "./middlewares/validations"
import { GetFeedData } from "@careerfairy/shared-lib/sparks/sparks"

export const getSparksFeed = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation({
         userId: string().trim().min(1).optional().nullable(),
         groupId: string().trim().min(1).optional(),
         numberOfSparks: number().min(1).optional(),
      }),
      async (data: GetFeedData, context) => {
         try {
            if ("userId" in data) {
               if (data.userId) {
                  return sparkRepo.getUserSparksFeed(
                     data.userId,
                     data.numberOfSparks
                  )
               } else {
                  return sparkRepo.getPublicSparksFeed(data.numberOfSparks)
               }
            }

            if ("groupId" in data) {
               return sparkRepo.getGroupSparksFeed(
                  data.groupId,
                  data.numberOfSparks
               )
            }

            throw new functions.https.HttpsError(
               "invalid-argument",
               "No userId or groupId provided"
            )
         } catch (error) {
            logAndThrow("Error in generating user feed", {
               data,
               error,
               context,
            })
         }
      }
   )
)

export const markSparkAsSeenByUser = functions
   .region(config.region)
   .https.onCall(
      middlewares(
         dataValidation({
            sparkId: string().required(),
         }),
         userAuthExists(),
         async (
            data: {
               sparkId: string
            },
            context
         ) => {
            try {
               const userEmail = context.auth.token.email
               const sparkId = data.sparkId

               await sparkRepo.markSparkAsSeenByUser(userEmail, sparkId)

               await sparkRepo.removeSparkFromUserFeed(userEmail, sparkId)

               await sparkRepo.replenishUserFeed(userEmail)

               functions.logger.info(
                  `Marked spark ${sparkId} as seen by user ${userEmail}`
               )
            } catch (error) {
               logAndThrow("Error in marking spark as seen by user", {
                  data,
                  error,
                  context,
               })
            }
         }
      )
   )
