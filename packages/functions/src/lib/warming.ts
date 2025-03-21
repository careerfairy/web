import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions"
import { logger } from "firebase-functions/v2"
import { onSchedule } from "firebase-functions/v2/scheduler"
import functionsAxios from "../api/axios"
import { KEEP_WARM_HEADER } from "../middlewares-gen2/onRequest/validations"

const functionsToWarm = [
   FUNCTION_NAMES.exampleHttp,
   FUNCTION_NAMES.customerIORecommendedLivestreamsWebhook,
   FUNCTION_NAMES.customerIORecommendedSparksWebhook,
   // Add more functions as needed
]

/**
 * Scheduled function that pings all functions in the list every 5 minutes
 */
export const keepFunctionsWarm = onSchedule(
   {
      schedule: "every 5 minutes",
   },
   async () => {
      logger.info("Starting keep-warm cycle")

      const requests = functionsToWarm.map(async (functionName) => {
         try {
            await functionsAxios.get(`/${functionName}`, {
               headers: {
                  [KEEP_WARM_HEADER]: "true",
               },
               timeout: 10000, // 10 second timeout
            })
            logger.info(`Successfully warmed function: ${functionName}`)
            return { function: functionName, success: true }
         } catch (error) {
            logger.error(`Failed to warm function: ${functionName}`, error)
            return { function: functionName, success: false }
         }
      })

      const results = await Promise.allSettled(requests)
      logger.info(
         `Completed keep-warm cycle. ${
            results.filter(
               (r) => r.status === "fulfilled" && (r.value as any).success
            ).length
         }/${functionsToWarm.length} functions successfully warmed`
      )
   }
)
