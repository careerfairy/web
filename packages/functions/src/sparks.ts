import {
   sortSeenSparks,
   sortSparksByIds,
} from "@careerfairy/shared-lib/sparks/sparks"
import { RuntimeOptions } from "firebase-functions"
import { SchemaOf, number, object } from "yup"
import { sparkRepo, userRepo } from "./api/repositories"
import config from "./config"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation, userAuthExists } from "./middlewares/validations"
import functions = require("firebase-functions")

/**
 * Functions runtime settings
 */
const runtimeSettings: RuntimeOptions = {
   memory: "1GB",
}

type GetUserSeenSparks = {
   limit: number
}

const getUserSeenSparksSchema: SchemaOf<GetUserSeenSparks> = object().shape({
   limit: number().min(1).default(20).required(),
})

export const getUserSeenSparks = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .https.onCall(
      middlewares(
         dataValidation(getUserSeenSparksSchema),
         userAuthExists(),
         async (data: GetUserSeenSparks, context) => {
            try {
               const seenSparks = await userRepo.getUserSeenSparks(
                  context.auth?.token?.email
               )

               if (!seenSparks) return []

               const sparkIds = sortSeenSparks(seenSparks, data.limit)

               const sparks = (await sparkRepo.getSparksByIds(sparkIds)) || []

               // Re sort ensuring order stays the same after fetching data
               const sortedSparks = sortSparksByIds(sparkIds, sparks)

               // Leaving const to allow debugging
               return sortedSparks
            } catch (error) {
               functions.logger.error(
                  "Error while retrieving User SeenSparks by IDs",
                  data,
                  error,
                  context
               )
               return null
            }
         }
      )
   )
