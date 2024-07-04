import algoliasearch from "algoliasearch"
import { knownIndexes } from "../lib/search/searchIndexes"

export const algoliaClient = algoliasearch(
   process.env.ALGOLIA_APP_ID,
   process.env.ALGOLIA_API_KEY
)

const shouldUseEmulators = () => {
   // TODO: check .env.local not working
   // return true
   if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS) {
      return true
   }
   return false
}

const isTestEnvironment = () => {
   return process.env.NEXT_PUBLIC_DEV_NAME === "test"
}

const getEnvPrefix = () => {
   if (!shouldUseEmulators()) {
      return "prod"
   }

   if (isTestEnvironment()) {
      return "test"
   }

   // TODO: Check .env.local not working
   return process.env.NEXT_PUBLIC_DEV_NAME || "unknown" // walterGoncalves
}

const initAlgoliaIndex = (indexName: string) => {
   return algoliaClient.initIndex(`${getEnvPrefix()}_${indexName}`)
}

export const livestreamIndex = initAlgoliaIndex(
   knownIndexes.livestreams.indexName
)
export const sparksIndex = initAlgoliaIndex(knownIndexes.sparks.indexName)
