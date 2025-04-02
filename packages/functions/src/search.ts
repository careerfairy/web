import * as functions from "firebase-functions"
import * as yup from "yup"

import {
   DocumentSnapshot,
   Query,
   QuerySnapshot,
} from "firebase-admin/firestore"
import { IndexName, indexNames, knownIndexes } from "./lib/search/searchIndexes"

import { onRequest } from "firebase-functions/v2/https"
import { firestore } from "./api/firestoreAdmin"
import { getData } from "./lib/search/searchIndexGenerator"
import { configureSettings, initAlgoliaIndex } from "./lib/search/util"
import { defaultTriggerRunTimeConfigV2 } from "./lib/triggers/util"

const DOCS_PER_INDEXING = 250

/**
 * How it works:
 * 1. Fetches an entire firestore collection from Firestore in batches of 250 documents.
 * 2. Indexes the documents in Algolia.
 * 3. Repeats until all document batches have been indexed.
 *
 * How to Trigger:
 * Development: curl "http://127.0.0.1:5001/careerfairy-e1fd9/europe-west1/fullIndexSync?indexName=livestreams&secretKey=123"
 * Production: curl "https://europe-west1-careerfairy-e1fd9.cloudfunctions.net/fullIndexSync?indexName=livestreams&secretKey=123"
 *
 * Where to get the secret key:
 * 1. ALGOLIA_FULL_SYNC_SECRET_KEY in the .env file in functions package
 */
export const fullIndexSync = onRequest(
   defaultTriggerRunTimeConfigV2,
   async (req, res) => {
      if (req.method !== "GET") {
         res.status(405).send("Method Not Allowed")
         return
      }

      const schema = yup.object().shape({
         indexName: yup
            .mixed<IndexName>()
            .oneOf<IndexName>(
               indexNames,
               `Index name must be one of ${indexNames.join(", ")}`
            )
            .required("Index name is required as a query parameter"),
         secretKey: yup
            .string()
            .required("Secret key is required as a query parameter")
            .equals(
               [process.env.ALGOLIA_FULL_SYNC_SECRET_KEY],
               "Invalid secret key"
            ),
      })

      // Validate the request query against the schema
      const { indexName } = await schema.validate(req.query)

      // Initialize the Algolia index
      const index = initAlgoliaIndex(indexName)

      // Get the known indexes
      const {
         collectionPath,
         fields,
         shouldIndex,
         fullIndexSyncQueryConstraints,
         transformData,
         settings,
      } = knownIndexes[indexName]

      if (settings) {
         functions.logger.info(`Configuring settings for ${indexName}`)
         await configureSettings(settings, index)
         functions.logger.info(`Settings configured for ${indexName}`)
      }

      // Reference to the Firestore collection
      let collectionRef: Query = firestore.collection(collectionPath)

      // Apply constraints if any
      if (fullIndexSyncQueryConstraints) {
         collectionRef = fullIndexSyncQueryConstraints(collectionRef)
      }

      // Get the total number of documents in the collection
      const snap = await collectionRef.count().get()
      const totalDocuments = snap.data().count

      // Initialize the count of synced documents
      let syncedDocuments = 0

      // Variables to hold the document snapshots and the last document snapshot
      let documentSnapshots: QuerySnapshot
      let startAfter: DocumentSnapshot | undefined

      // Loop through the collection in batches
      do {
         // Create a query for the batch
         const query = startAfter
            ? collectionRef.startAfter(startAfter).limit(DOCS_PER_INDEXING)
            : collectionRef.limit(DOCS_PER_INDEXING)

         // Get the document snapshots for the batch
         documentSnapshots = await query.get()

         // Filter out the documents that should not be indexed
         const docsToIndex = documentSnapshots.docs.filter((doc) => {
            const docData = doc.data()
            // If shouldIndex is defined and returns false, skip indexing
            return !shouldIndex || shouldIndex(docData)
         })

         // Create a batch of documents to index
         const batch = index.saveObjects(
            docsToIndex.map((doc) => getData(doc, fields, transformData))
         )

         // Wait for the batch to be indexed
         await batch.wait()

         // Update the count of synced documents
         syncedDocuments += docsToIndex.length
         functions.logger.info(
            `Synced ${syncedDocuments} of ${totalDocuments} documents`
         )

         // Set the last document snapshot for the next batch
         startAfter = documentSnapshots.docs[documentSnapshots.docs.length - 1]
      } while (documentSnapshots.size === DOCS_PER_INDEXING)

      res.status(200).send("Index sync completed")
   }
)
