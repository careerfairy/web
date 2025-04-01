import * as functions from "firebase-functions"

import { ChangeType, getChangeTypeEnum, isTestEnvironment } from "../../util"
import {
   configureSettings,
   initAlgoliaIndex,
   logCreateIndex,
   logDeleteIndex,
   logUpdateIndex,
} from "./util"

import { SearchIndex } from "algoliasearch"
import { DocumentSnapshot, Query } from "firebase-admin/firestore"
import { onDocumentWritten } from "firebase-functions/firestore"
import { defaultTriggerRunTimeConfig } from "../triggers/util"

type DocumentTransformer<DataType = any, DataTypeTransformed = DataType> = (
   doc: DataType
) => DataTypeTransformed

/**
 * Get the workflow id from the environment variables
 * This is used to isolate test data and operations
 * @returns the workflow id or the dev name or "unknown" if neither is set
 */
export const getWorkflowId = () => {
   if (process.env.NEXT_PUBLIC_UNIQUE_WORKFLOW_ID) {
      return process.env.NEXT_PUBLIC_UNIQUE_WORKFLOW_ID
   }

   if (isTestEnvironment()) {
      return "test"
   }
   return process.env.DEV_NAME || "unknown"
}

export const getData = (
   snapshot: DocumentSnapshot,
   fields: string[],
   transformData?: DocumentTransformer
) => {
   const payload: {
      [key: string]: boolean | string | number
   } = {
      objectID: snapshot.id,
      ...(isTestEnvironment() && {
         workflowId: getWorkflowId(),
      }),
   }

   let data = snapshot.data()

   if (transformData) {
      data = transformData(data)
   }

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
   index: SearchIndex,
   transformData?: DocumentTransformer
) => {
   try {
      const data = getData(snapshot, fields, transformData)

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
   index: SearchIndex,
   transformData?: DocumentTransformer
) => {
   try {
      functions.logger.debug("Detected a change, execute indexing")

      const beforeData = before.data()
      // loop through the after data snapshot to see if any properties were removed
      const undefinedAttrs = Object.keys(beforeData).filter(
         (key) => after.get(key) === undefined || after.get(key) === null
      )
      functions.logger.debug("undefinedAttrs", undefinedAttrs)

      const data = getData(after, fields, transformData)
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
// Helper type to extract keys with number or string type properties like `startTimeMs` or `title`
type NumericKey<T> = {
   [K in keyof T]: T[K] extends number | string | boolean
      ? K extends string
         ? K
         : never
      : never
}[keyof T]

export type IndexSettings<
   DataTypeTransformed = any,
   TIndexName extends string = string
> = {
   /**
    * Attributes for text search; listing more enhances speed and reduces index size.
    * The position of attributes in the list determines their priority in the search.
    */
   searchableAttributes: Array<keyof DataTypeTransformed & string>
   /**
    * Attributes to use for filtering like tags, company, isPublic, etc.
    */
   attributesForFaceting: Array<keyof DataTypeTransformed & string>

   /**
    * Specifies the replicas for indexing in the format example: `livestreams_startTimeMs_asc`.
    * Ensure `attributeName` is a numeric or string key from `DataTypeTransformed`.
    */
   replicas: Array<`${TIndexName}_${NumericKey<DataTypeTransformed>}_${
      | "asc"
      | "desc"}`>
}

/**
 * Defines the structure for an index configuration.
 *
 * @template DataType The type of the data before any transformation. Defaults to any.
 * @template DataTypeTransformed The type of the data after transformation. Defaults to the same as DataType.
 */
export type Index<
   DataType = any,
   DataTypeTransformed = DataType,
   TIndexName extends string = string
> = {
   /**
    * Path to the collection to index (e.g. "livestreams" or "livestreams/{docId}/questions")
    */
   collectionPath: string
   /**
    * Fields to index. be sure to avoid indexing fields that are too large since Algolia has a limit of 10kb per record.
    * @example ["id", "title", "summary"]
    */
   fields: Array<keyof DataTypeTransformed & string>
   /**
    * Name of the index in Algolia
    */
   indexName: TIndexName
   /**
    * Function to transform the data before indexing.
    */
   transformData?: DocumentTransformer<DataType, DataTypeTransformed>
   settings?: IndexSettings<DataTypeTransformed, TIndexName>
   /**
    * Function that determines whether or not to index a document. If not provided, all documents will be indexed.
    * @param doc The document to index
    * @returns  Whether or not to index the document
    */
   shouldIndex?: (doc: Partial<DataType>) => boolean
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
      const { collectionPath, fields, shouldIndex, settings, transformData } =
         indexes[indexName]

      const indexClient = initAlgoliaIndex(indexName)

      const documentPath = collectionPath + "/{docId}"

      exports[indexName] = onDocumentWritten(
         {
            document: documentPath,
            ...defaultTriggerRunTimeConfig,
         },
         async (event) => {
            if (settings) {
               await configureSettings(settings, indexClient)
            }

            const changeType = getChangeTypeEnum(event)
            // Get the document data
            const docData = event.data.after.exists
               ? event.data.after.data()
               : event.data.before.data()

            // If shouldIndex is defined and returns false, skip indexing
            if (shouldIndex && !shouldIndex(docData)) {
               functions.logger.debug(
                  `Skipping indexing for document ${
                     event.data.after.id || event.data.before.id
                  }`
               )
               return
            }

            switch (changeType) {
               case ChangeType.CREATE:
                  await handleCreateDocument(
                     event.data.after,
                     fields,
                     indexClient,
                     transformData
                  )
                  break
               case ChangeType.UPDATE:
                  await handleUpdateDocument(
                     event.data.before,
                     event.data.after,
                     fields,
                     indexClient,
                     transformData
                  )
                  break
               case ChangeType.DELETE:
                  await handleDeleteDocument(event.data.before, indexClient)
                  break
               default:
                  throw new Error(`Unknown change type ${changeType}`)
            }
         }
      )
   }

   return exports
}
