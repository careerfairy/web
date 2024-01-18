import { logger } from "firebase-functions"
import { algoliaClient } from "../../api/algolia"
import { getEnvPrefix } from "../../util"

export const logCreateIndex = (id: string, data: object) => {
   logger.info(`Creating new Algolia index for document ${id}`, data)
}

export const logUpdateIndex = (id: string, data: object) => {
   logger.info(`Updating existing Algolia index for document ${id}`, data)
}

export const logDeleteIndex = (id: string) => {
   logger.info(`Deleting existing Algolia index for document ${id}`)
}

export const initAlgoliaIndex = (indexName: string) => {
   return algoliaClient.initIndex(`${indexName}${getEnvPrefix()}`)
}
