import algoliasearch from "algoliasearch"
import { logger } from "firebase-functions/v2"
import { isLocalEnvironment, isTestEnvironment } from "../util"

let algoliaAppId = process.env.ALGOLIA_APP_ID
let algoliaApiKey = process.env.ALGOLIA_API_KEY

if (isLocalEnvironment() && !isTestEnvironment()) {
   algoliaAppId = process.env.DEV_ALGOLIA_APP_ID
   algoliaApiKey = process.env.DEV_ALGOLIA_API_KEY

   logger.info(
      `Using Algolia in DEV mode (${process.env.DEV_NAME}), please ensure you have the correct credentials for your OWN Algolia application`
   )
}

export const algoliaClient = algoliasearch(algoliaAppId, algoliaApiKey)
