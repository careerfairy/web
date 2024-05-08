import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import { RuntimeOptions } from "firebase-functions"
import { SchemaOf, array, number, object, string } from "yup"
import { sparkRepo, userRepo } from "./api/repositories"
import config from "./config"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation, userAuthExists } from "./middlewares/validations"
import functions = require("firebase-functions")

/**
 * Functions runtime settings
 */
const runtimeSettings: RuntimeOptions = {
   memory: "256MB",
}

type GetSparksByIds = {
   sparkIds: string[]
}

const getSparksByIdsSchema: SchemaOf<GetSparksByIds> = object().shape({
   sparkIds: array().of(string()),
})

type GetUserSeenSparks = {
   limit: number
}

const getUserSeenSparksSchema: SchemaOf<GetUserSeenSparks> = object().shape({
   limit: number().min(1).default(20).required(),
})

export const getSparksByIds = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .https.onCall(
      middlewares(
         dataValidation(getSparksByIdsSchema),
         userAuthExists(),
         async (data: GetSparksByIds, context) => {
            try {
               return sparkRepo.getSparksByIds(data.sparkIds)
            } catch (error) {
               functions.logger.error(
                  "Error while retrieving Sparks by IDs",
                  data,
                  error,
                  context
               )
               return null
            }
         }
      )
   )

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

               const sparkIds = sortSparksMapIds(seenSparks.sparks, data.limit)

               return sparkRepo.getSparksByIds(sparkIds)
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

const sortSparksMapIds = (
   sparks: {
      [sparkId: string]: Timestamp
   },
   limit: number
): string[] => {
   const keys = Object.keys(sparks)

   if (!keys.length) return []
   const sortedSparks = keys
      .map((sparkId) => {
         return {
            sparkId: sparkId,
            seenTimestamp: sparks[sparkId],
         }
      })
      .sort(
         (baseSpark, comparisonSpark) =>
            comparisonSpark.seenTimestamp.toMillis() -
            baseSpark.seenTimestamp.toMillis()
      )

   return sortedSparks.map((sortedSpark) => sortedSpark.sparkId).slice(0, limit)
}
