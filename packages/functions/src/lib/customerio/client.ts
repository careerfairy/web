import { APIClient, RegionEU, TrackClient } from "customerio-node"
import { logger } from "firebase-functions/v2"
import { isLocalEnvironment } from "../../util"

const createTrackingClient = () => {
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
