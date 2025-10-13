import axios, { AxiosInstance } from "axios"
import { logger } from "firebase-functions"
import { isLocalEnvironment, isTestEnvironment } from "../../util"

const CUSTOMERIO_TRACK_API_URL = "https://track-eu.customer.io"

/**
 * Creates a configured axios instance for Customer.io API calls
 * Handles different environments (test, local, production) with appropriate credentials
 * @returns Configured axios instance with authentication headers
 */
export function createCustomerIOAxiosInstance(): AxiosInstance {
   if (isTestEnvironment()) {
      logger.info("Using Customer.io axios client mock")
      // Create a stub axios instance for test environment
      return axios.create()
   }

   let siteId = process.env.CUSTOMERIO_SITE_ID
   let apiKey = process.env.CUSTOMERIO_TRACKING_API_KEY

   if (isLocalEnvironment()) {
      siteId = process.env.DEV_CUSTOMERIO_SITE_ID
      apiKey = process.env.DEV_CUSTOMERIO_TRACKING_API_KEY
      logger.info(
         "Running in local environment. Ensure DEV_CUSTOMERIO_SITE_ID and DEV_CUSTOMERIO_TRACKING_API_KEY are set for testing."
      )
   }

   const auth = Buffer.from(`${siteId}:${apiKey}`).toString("base64")

   return axios.create({
      baseURL: CUSTOMERIO_TRACK_API_URL,
      headers: {
         Authorization: `Basic ${auth}`,
         "Content-Type": "application/json",
      },
   })
}
