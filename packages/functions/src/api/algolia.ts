import algoliasearch, { SearchClient } from "algoliasearch"
import { logger } from "firebase-functions/v2"
import { isLocalEnvironment, isTestEnvironment } from "../util"

export const getAlgoliaClient = (): SearchClient => {
   let algoliaAppId = process.env.ALGOLIA_APP_ID
   let algoliaApiKey = process.env.ALGOLIA_API_KEY

   if (isLocalEnvironment() && !isTestEnvironment()) {
      algoliaAppId = process.env.DEV_ALGOLIA_APP_ID || algoliaAppId
      algoliaApiKey = process.env.DEV_ALGOLIA_API_KEY || algoliaApiKey
      logger.info(
         `Using Algolia in DEV mode (${process.env.DEV_NAME}), please ensure you have the correct credentials for your OWN Algolia application`
      )
   } else if (isTestEnvironment()) {
      logger.info(
         `Using Algolia in PROD mode, last api key ends in: ${algoliaApiKey?.slice(
            -10
         )}`
      )
   }

   return algoliasearch(algoliaAppId, algoliaApiKey)
}
