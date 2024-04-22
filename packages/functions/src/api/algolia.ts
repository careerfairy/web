import algoliasearch from "algoliasearch"
import { isTestEnvironment } from "src/util"

let appId: string
let apiKey: string

// TODO: Relocate this variable to a test env file as part of PR: https://github.com/careerfairy/web/pull/915
if (isTestEnvironment()) {
   appId = "W1YCBYSEZ3"
   apiKey = "799a8ac590c7132b16979367215eb8c3"
} else {
   appId = process.env.ALGOLIA_APP_ID
   apiKey = process.env.ALGOLIA_API_KEY
}

export const algoliaClient = algoliasearch(appId, apiKey)
