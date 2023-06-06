import functions = require("firebase-functions")
import { admin } from "./api/firestoreAdmin"
import config from "./config"

const DAY_IN_SECONDS = 24 * 60 * 60

export const periodicallyRemoveCachedDocument = functions
   .region(config.region)
   .pubsub.schedule("every 24 hours")
   .timeZone("Europe/Zurich")
   .onRun(async () => {
      const results = await Promise.allSettled([
         // remove user recommended events older than 2 days
         removeExpiredCacheDocuments(
            "cache/functions/recommendedEvents",
            2 * DAY_IN_SECONDS
         ),
         // Remove cache/function/analytics documents older than 2 days
         removeExpiredCacheDocuments(
            "cache/functions/analytics",
            7 * DAY_IN_SECONDS
         ),
         // Remove Merge cache older than 3 days
         removeExpiredCacheDocuments("cache/merge/getJobs", 3 * DAY_IN_SECONDS),
         removeExpiredCacheDocuments("cache/merge/getJob", 3 * DAY_IN_SECONDS),
         removeExpiredCacheDocuments(
            "cache/merge/getApplications",
            3 * DAY_IN_SECONDS
         ),
         removeExpiredCacheDocuments(
            "cache/merge/getApplication",
            3 * DAY_IN_SECONDS
         ),
      ])

      const totalRemoved = results
         .map((promiseResult) => {
            if (promiseResult.status == "fulfilled") {
               return promiseResult.value.length
            } else {
               functions.logger.warn(
                  "Failed to delete some documents",
                  promiseResult.reason
               )
               return 0
            }
         })
         .reduce((prev, curr) => prev + curr, 0)

      functions.logger.info(`Removed ${totalRemoved} documents`)

      return null
   })

const removeExpiredCacheDocuments = (
   collectionPath: string,
   expireOlderThanSeconds: number
) => {
   const pastDate = new Date(Date.now() - expireOlderThanSeconds * 1000)

   return admin
      .firestore()
      .collection(collectionPath)
      .where("expiresAt", "<", pastDate)
      .get()
      .then((querySnapshot) => {
         const promises = []
         querySnapshot.forEach((doc) => {
            functions.logger.info(`Deleting doc: ${doc.ref.path}`)
            promises.push(doc.ref.delete())
         })
         return Promise.allSettled(promises)
      })
}
