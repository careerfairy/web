import algoliaSearchClient from "./AlgoliaInstance"

export const initAlgoliaIndex = (indexName: string) => {
   return algoliaSearchClient.initIndex(indexName)
}
