import algoliasearch, { SearchClient } from "algoliasearch"
import { logger } from "firebase-functions/v2"
import { isLocalEnvironment, isTestEnvironment } from "../util"

export const getAlgoliaClient = (): SearchClient => {
   let algoliaAppId = process.env.ALGOLIA_APP_ID || "WBAREE5TWQ"
   let algoliaApiKey =
      process.env.ALGOLIA_API_KEY || "993b607c53d0965f6d93f10daea25a68"

   if (isLocalEnvironment() && !isTestEnvironment()) {
      algoliaAppId = process.env.DEV_ALGOLIA_APP_ID
      algoliaApiKey = process.env.DEV_ALGOLIA_API_KEY

      logger.info(
         `Using Algolia in DEV mode (${process.env.DEV_NAME}), please ensure you have the correct credentials for your OWN Algolia application`
      )
   }

   return algoliasearch(algoliaAppId, algoliaApiKey)
}
