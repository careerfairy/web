import { getEnvPrefix } from "util/CommonUtil"
import algoliaSearchClient from "./AlgoliaInstance"

export const initAlgoliaIndex = (indexName: string) => {
   return algoliaSearchClient.initIndex(`${getEnvPrefix()}_${indexName}`)
}
