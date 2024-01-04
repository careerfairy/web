import * as functions from "firebase-functions"
import * as yup from "yup"

import { DocumentSnapshot, QuerySnapshot } from "firebase-admin/firestore"
import { IndexName, indexNames, knownIndexes } from "./lib/search/searchIndexes"

import { firestore } from "./api/firestoreAdmin"
import config from "./config"
import { getData } from "./lib/search/searchIndexGenerator"
import { initAlgoliaIndex } from "./lib/search/util"
import { defaultTriggerRunTimeConfig } from "./lib/triggers/util"

const DOCS_PER_INDEXING = 250

/**
 * 1. Fetches an entire firestore collection from Firestore in batches of 250 documents.
 * 2. Indexes the documents in Algolia.
 * 3. Repeats until all document batches have been indexed.
 */
export const fullIndexSync = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .https.onRequest(async (req, res) => {
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
            ),
      })

      const { indexName } = await schema.validate(req.query)

      const index = initAlgoliaIndex(indexName)

      const { collectionPath, fields } = knownIndexes[indexName]

      const collectionRef = firestore.collection(collectionPath)

      const snap = await collectionRef.count().get()

      const totalDocuments = snap.data().count

      let syncedDocuments = 0

      let documentSnapshots: QuerySnapshot
      let startAfter: DocumentSnapshot | undefined

      do {
         const query = startAfter
            ? collectionRef.startAfter(startAfter).limit(DOCS_PER_INDEXING)
            : collectionRef.limit(DOCS_PER_INDEXING)

         documentSnapshots = await query.get()

         const batch = index.saveObjects(
            documentSnapshots.docs.map((doc) => getData(doc, fields))
         )

         await batch.wait()

         syncedDocuments += documentSnapshots.size
         functions.logger.info(
            `Synced ${syncedDocuments} of ${totalDocuments} documents`
         )

         startAfter = documentSnapshots.docs[documentSnapshots.docs.length - 1]
      } while (documentSnapshots.size === DOCS_PER_INDEXING)

      res.status(200).send("Index sync completed")
   })
