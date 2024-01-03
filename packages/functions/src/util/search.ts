import { logger } from "firebase-functions"

export const createIndex = (id: string, data: object) => {
   logger.info(`Creating new Algolia index for document ${id}`, data)
}

export const updateIndex = (id: string, data: object) => {
   logger.info(`Updating existing Algolia index for document ${id}`, data)
}

export const deleteIndex = (id: string) => {
   logger.info(`Deleting existing Algolia index for document ${id}`)
}

export const fieldNotExist = (field: string) => {
   logger.warn(
      `The field "${field}" was specified in the extension config but was not found on collection data.`
   )
}
