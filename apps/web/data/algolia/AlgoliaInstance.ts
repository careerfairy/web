import algoliasearch, { SearchClient } from "algoliasearch"

const config = {
   apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
   appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
}

// const asElementTypes = <T>(et: { [K in keyof T]: SearchIndex }) => et

/*
 * Returns the search client.
 * */
export const createAlgoliaInstance = (): SearchClient => {
   return algoliasearch(config.appId, config.apiKey)
}

const algoliaSearchClient = createAlgoliaInstance()

export default algoliaSearchClient
