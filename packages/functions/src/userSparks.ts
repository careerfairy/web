import functions = require("firebase-functions")
import { string } from "yup"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { sparkRepo } from "./api/repositories"

import { dataValidation, userAuthExists } from "./middlewares/validations"
import { GetFeedData } from "@careerfairy/shared-lib/sparks/sparks"

export const getSparksFeed = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation({
         userId: string().optional(),
         groupId: string().optional(),
      }),
      async (data: GetFeedData, context) => {
         // If the user is not authenticated, then we will generate a public feed
         const userEmail = data.userId || "public"
         const groupId = data.groupId
         try {
            return sparkRepo.getUserFeed(userEmail)
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

               const userFeed = await sparkRepo.removeSparkFromUserFeed(
                  userEmail,
                  sparkId
               )

               await sparkRepo.replenishUserFeed(userEmail, userFeed)
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
