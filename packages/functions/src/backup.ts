import firestore = require("@google-cloud/firestore")

import {
   type ProjectCollectionId,
   ALL_PROJECT_COLLECTION_IDS,
} from "@careerfairy/shared-lib/constants/collections"
import { onSchedule } from "firebase-functions/scheduler"

const collectionsToExclude: ProjectCollectionId[] = ["impressions"]

// Run this function every hour
export const exportFirestoreBackup = onSchedule(
   {
      schedule: "0 0,12 * * *",
      timeZone: "Europe/Zurich",
   },
   async () => {
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
   }
)
