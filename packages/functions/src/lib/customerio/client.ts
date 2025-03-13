import { APIClient, RegionEU, TrackClient } from "customerio-node"
import { logger } from "firebase-functions/v2"
import { isLocalEnvironment, isTestEnvironment } from "../../util"

// Create partial types for our stubs to avoid TypeScript errors

const createTrackingClient = () => {
   if (isTestEnvironment()) {
      logger.info("Using Customer.io track client mock")
      return customerIoTrackClientStub() as TrackClient
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

   return new TrackClient(siteId, apiKey, {
      region: RegionEU,
   })
}

const createApiClient = () => {
   if (isTestEnvironment()) {
      logger.info("Using Customer.io API client mock")
      return customerIoApiClientStub() as APIClient
   }

   let appKey = process.env.CUSTOMERIO_APP_API_KEY

   if (isLocalEnvironment()) {
      appKey = process.env.DEV_CUSTOMERIO_APP_API_KEY
   }

   return new APIClient(appKey, {
      region: RegionEU,
   })
}

export const trackingClient = createTrackingClient()
export const apiClient = createApiClient()

/**
 * Customer.io TrackClient stub for test environments
 * Implements common methods used in the application
 */
function customerIoTrackClientStub(): Partial<TrackClient> {
   // Return empty object for all methods to satisfy Record<string, any> return type
   const emptyResponse = Promise.resolve({} as Record<string, any>)

   return {
      identify: () => emptyResponse,
      destroy: () => emptyResponse,
      // Add other methods as needed
   }
}

/**
 * Customer.io APIClient stub for test environments
 * Implements common methods used in the application
 */
function customerIoApiClientStub(): Partial<APIClient> {
   // Return empty object for simple methods to satisfy Record<string, any> return type
   const emptyResponse = Promise.resolve({} as Record<string, any>)

   return {
      sendEmail: () => emptyResponse,
      sendPush: () => emptyResponse,
      // Add other methods as needed
   }
}
