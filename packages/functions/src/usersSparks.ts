import functions = require("firebase-functions")
import { sparkRepo } from "./api/repositories"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"

import { dataValidation } from "./middlewares/validations"

export const generateUserSparkFeed = functions
   .region(config.region)
   .https.onCall(
      middlewares(
         async (
            data: {
               initalSparkId: string
            },
            context
         ) => {
            try {
               const feed = await sparkRepo.getUserFeed()
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
