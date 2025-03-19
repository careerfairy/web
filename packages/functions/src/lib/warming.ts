import axios from "axios"
import { Request, Response } from "firebase-functions/v1"
import { logger } from "firebase-functions/v2"
import { onSchedule } from "firebase-functions/v2/scheduler"
import config from "../config"

// Flag to identify warming requests
export const KEEP_WARM_HEADER = "x-keepwarm"

/**
 * Utility function to check if a request is a warming request
 * @param req Express request object
 * @param res Express response object
 * @returns boolean indicating if the request was handled as a warming request
 */
export const handleWarmingRequest = (req: Request, res: Response): boolean => {
   // Check if the warming header is present
   if (req.get(KEEP_WARM_HEADER) === "true") {
      logger.info("Handling keep-warm request")
      res.status(200).send("Function is warm")
      return true
   }
   return false
}

const functionsToWarm = [
   "exampleHttpFunction",
   // Add more functions as needed
]

// Base URL for your Firebase functions
const getFunctionUrl = (functionName: string): string => {
   return `${config.functionsBaseUrl}/${functionName}`
}

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
         const url = getFunctionUrl(functionName)
         try {
            await axios.get(url, {
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
