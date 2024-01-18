import * as functions from "firebase-functions"

import { ChangeType, getChangeTypeEnum } from "../../util"
import {
   initAlgoliaIndex,
   logCreateIndex,
   logDeleteIndex,
   logUpdateIndex,
} from "./util"

import { DocumentSnapshot, Query } from "firebase-admin/firestore"
import { SearchIndex } from "algoliasearch"
import config from "../../config"
import { defaultTriggerRunTimeConfig } from "../triggers/util"

export const getData = (snapshot: DocumentSnapshot, fields: string[]) => {
   const payload: {
      [key: string]: boolean | string | number
   } = {
      objectID: snapshot.id,
   }

   const data = snapshot.data()

   return fields.reduce((acc, field) => {
      if (field in data && data[field] !== undefined && data[field] !== null) {
         acc[field] = data[field] as any
      }
      return acc
   }, payload)
}

const handleCreateDocument = async (
   snapshot: DocumentSnapshot,
   fields: string[],
   index: SearchIndex
) => {
   try {
      const data = getData(snapshot, fields)

      functions.logger.debug({
         ...data,
      })

      logCreateIndex(snapshot.id, data)
      await index.partialUpdateObject(data, { createIfNotExists: true })
   } catch (e) {
      functions.logger.error(e)
   }
}

const handleUpdateDocument = async (
   before: DocumentSnapshot,
   after: DocumentSnapshot,
   fields: string[],
   index: SearchIndex
) => {
   try {
      functions.logger.debug("Detected a change, execute indexing")

      const beforeData = before.data()
      // loop through the after data snapshot to see if any properties were removed
      const undefinedAttrs = Object.keys(beforeData).filter(
         (key) => after.get(key) === undefined || after.get(key) === null
      )
      functions.logger.debug("undefinedAttrs", undefinedAttrs)

      const data = getData(after, fields)
      // if no attributes were removed, then use partial update of the record.
      if (undefinedAttrs.length === 0) {
         logUpdateIndex(after.id, data)
         functions.logger.debug("execute partialUpdateObject")

         await index.partialUpdateObject(data, {
            createIfNotExists: true,
         })
      } else {
         // Else if an attribute was removed, then use save object of the record.

         // delete null value attributes before saving.
         undefinedAttrs.forEach((attr) => delete data[attr])

         logUpdateIndex(after.id, data)
         functions.logger.debug("execute saveObject")
         await index.saveObject(data)
      }
   } catch (e) {
      functions.logger.error(e)
   }
}

const handleDeleteDocument = async (
   deleted: DocumentSnapshot,
   index: SearchIndex
) => {
   try {
      logDeleteIndex(deleted.id)
      await index.deleteObject(deleted.id)
   } catch (e) {
      functions.logger.error(e)
   }
}

export type Index<T = any> = {
   /**
    * Path to the collection to index (e.g. "livestreams" or "livestreams/{docId}/questions")
    */
   collectionPath: string
   /**
    * Fields to index. be sure to avoid indexing fields that are too large since Algolia has a limit of 10kb per record.
    * @example ["id", "title", "summary"]
    */
   fields: (keyof T & string)[]
   /**
    * Name of the index in Algolia
    */
   indexName: string
   /**
    * Function that determines whether or not to index a document. If not provided, all documents will be indexed.
    * @param doc The document to index
    * @returns  Whether or not to index the document
    */
   shouldIndex?: (doc: Partial<T>) => boolean
   /**
    * Function that returns a query to use to filter the documents to index.
    * @param collectionQuery The collection query to filter
    * @returns The query to use to filter the documents to index
    */
   fullIndexSyncQueryConstraints?: (collectionQuery: Query) => Query
}

/**
 * Generates a set of functions that will generate an index in Algolia for each bundle.
 */
export function generateFunctionsFromIndexes(indexes: Record<string, Index>) {
   const exports = {}

   for (const indexName in indexes) {
      const { collectionPath, fields, shouldIndex } = indexes[indexName]

      const indexClient = initAlgoliaIndex(indexName)

      const documentPath = collectionPath + "/{docId}"

      exports[indexName] = functions
         .runWith(defaultTriggerRunTimeConfig)
         .region(config.region)
         .firestore.document(documentPath)
         .onWrite(async (change) => {
            const changeType = getChangeTypeEnum(change)
            // Get the document data
            const docData = change.after.exists
               ? change.after.data()
               : change.before.data()

            // If shouldIndex is defined and returns false, skip indexing
            if (shouldIndex && !shouldIndex(docData)) {
               functions.logger.debug(
                  `Skipping indexing for document ${
                     change.after.id || change.before.id
                  }`
               )
               return
            }

            switch (changeType) {
               case ChangeType.CREATE:
                  await handleCreateDocument(change.after, fields, indexClient)
                  break
               case ChangeType.UPDATE:
                  await handleUpdateDocument(
                     change.before,
                     change.after,
                     fields,
                     indexClient
                  )
                  break
               case ChangeType.DELETE:
                  await handleDeleteDocument(change.before, indexClient)
                  break
               default:
                  throw new Error(`Unknown change type ${changeType}`)
            }
         })
   }

   return exports
}
