import functions = require("firebase-functions")
import firestore = require("@google-cloud/firestore")
import config from "./config"

import {
   type ProjectCollectionId,
   ALL_PROJECT_COLLECTION_IDS,
} from "@careerfairy/shared-lib/constants/collections"

const collectionsToExclude: ProjectCollectionId[] = ["impressions"]

// Run this function every hour
export const exportFirestoreBackup = functions
   .region(config.region)
   .pubsub.schedule("0 0,12 * * *") // midnight and noon every day
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      const client = new firestore.v1.FirestoreAdminClient()

      const dateNow = new Date(Date.now())
      const bucket = `gs://careerfairy-backup/${dateNow.toDateString()}-${dateNow.toTimeString()}`

      const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT
      const databaseName = client.databasePath(projectId, "(default)")

      try {
         const responses = await client.exportDocuments({
            name: databaseName,
            outputUriPrefix: bucket,
            collectionIds: ALL_PROJECT_COLLECTION_IDS.filter(
               (collectionId) => !collectionsToExclude.includes(collectionId)
            ),
         })
         const response = responses[0]
         console.log(`Operation Name: ${response["name"]}`)
      } catch (err) {
         console.error(err)
         throw new Error("Export operation failed")
      }
   })
