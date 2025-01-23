import { RegionEU, TrackClient } from "customerio-node"
import { logger } from "firebase-functions/v2"
import { isLocalEnvironment } from "../../util"

const createTrackingClient = () => {
   let siteId = process.env.CUSTOMERIO_SITE_ID
   let apiKey = process.env.CUSTOMERIO_API_KEY

   if (isLocalEnvironment()) {
      siteId = process.env.DEV_CUSTOMERIO_SITE_ID
      apiKey = process.env.DEV_CUSTOMERIO_API_KEY
      logger.error(
         "Missing required .env.local environment variables for CustomerIO tracking client: DEV_CUSTOMERIO_SITE_ID and/or DEV_CUSTOMERIO_API_KEY"
      )
   }

   return new TrackClient(siteId, apiKey, {
      region: RegionEU,
   })
}

export const trackingClient = createTrackingClient()
