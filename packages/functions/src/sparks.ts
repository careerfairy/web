import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import { SeenSparks } from "@careerfairy/shared-lib/sparks/sparks"
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

               const sparkIds = sortSeenSparks(seenSparks, data.limit)

               const sparks = await sparkRepo.getSparksByIds(sparkIds)

               // Re sort ensuring order stays the same after fetching data
               const sortedSparks = (sparks || []).sort(
                  (baseSpark, comparisonSpark) => {
                     const baseSortedIndex = sparkIds.indexOf(baseSpark.id)
                     const comparisonSortedIndex = sparkIds.indexOf(
                        comparisonSpark.id
                     )

                     return baseSortedIndex - comparisonSortedIndex
                  }
               )

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

const sortSparksMapIds = (sparks: {
   [sparkId: string]: Timestamp
}): string[] => {
   const keys = Object.keys(sparks)

   if (!keys.length) return []
   const sortedSparks = keys
      .map((sparkId) => {
         return {
            sparkId: sparkId,
            seenTimestamp: sparks[sparkId],
         }
      })
      .sort(sortSparksBySeenTimestamp)

   return sortedSparks.map((sortedSpark) => sortedSpark.sparkId)
}

const sortSeenSparks = (seenSparks: SeenSparks[], limit: number): string[] => {
   const allSparks = seenSparks
      .flatMap((seenSpark) => {
         const sortedSparkIds = sortSparksMapIds(seenSpark.sparks)
         return sortedSparkIds.map((id) => {
            return {
               sparkId: id,
               seenTimestamp: seenSpark.sparks[id],
            }
         })
      })
      .sort(sortSparksBySeenTimestamp)

   return allSparks.map((sortedSpark) => sortedSpark.sparkId).slice(0, limit)
}

const sortSparksBySeenTimestamp = (baseSpark, comparisonSpark) =>
   comparisonSpark.seenTimestamp.toMillis() - baseSpark.seenTimestamp.toMillis()
