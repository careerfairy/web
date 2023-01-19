import functions = require("firebase-functions")
import { livestreamsRepo } from "./api/repositories"

export const syncLivestreamsOnWrite = functions
   .runWith({
      // Ensure that the function has enough time to finish all side effects
      timeoutSeconds: 540, // 9 minutes (max)
      /*
       * 256 MB (default) to 8 GB (max) pricing can be found here: https://cloud.google.com/functions/pricing#compute_time
       * 2GB costs about 6.2x more than 256MB per 100ms of execution time, but only starts charging after free tier is used up
       * */
      memory: "2GB",
   })
   .firestore.document("livestreams/{livestreamId}")
   .onWrite(
      async (
         change
         // context
      ) => {
         // const livestreamId = context.params.livestreamId

         const isCreate = !change.before.exists
         const isDelete = !change.after.exists
         const isUpdate = !isCreate && !isDelete

         const sideEffectPromises: Promise<unknown>[] = []
         if (isCreate) {
            // Run side effects for new livestream creations
         }

         if (isUpdate) {
            // Run side effects for livestream updates
         }

         if (isDelete) {
            // Run side effects for livestream deletions
         }

         // Run side effects for all livestream changes
         sideEffectPromises.push(
            livestreamsRepo.syncLiveStreamStatsWithLivestream(change)
         )

         return Promise.allSettled(sideEffectPromises).then((results) => {
            results.forEach((result) => {
               if (result.status === "rejected") {
                  functions.logger.error(result.reason)
               }
            })
         })
      }
   )
