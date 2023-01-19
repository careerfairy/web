import functions = require("firebase-functions")
import { livestreamsRepo } from "./api/repositories"
import { getChangeTypes } from "./util"
import { RuntimeOptions } from "firebase-functions/lib/function-configuration"
import { updateLiveStreamStats } from "./lib/stats"

const syncRunTimeConfig: RuntimeOptions = {
   // Ensure that the function has enough time to finish all side effects
   timeoutSeconds: 540, // 9 minutes (max)
   /*
    * 256 MB (default) to 8 GB (max) pricing can be found here: https://cloud.google.com/functions/pricing#compute_time
    * 2GB costs about 6.2x more than 256MB per 100ms of execution time, but only starts charging after free tier is used up
    * */
   memory: "2GB",
}
export const syncLivestreamsOnWrite = functions
   .runWith(syncRunTimeConfig)
   .firestore.document("livestreams/{livestreamId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncLivestreamsOnWrite",
      })

      const { isUpdate, isDelete, isCreate } = changeTypes

      // An array of promise side effects to be executed in parallel
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

      return handleSideEffects(sideEffectPromises)
   })

export const syncUserLivestreamDataOnWrite = functions
   .runWith(syncRunTimeConfig)
   .firestore.document("livestreams/{livestreamId}/userLivestreamData/{userId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncUserLivestreamDataOnWrite",
      })

      const { isUpdate, isDelete, isCreate } = changeTypes

      const {
         livestreamId,
         // userId
      } = context.params

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      if (isCreate) {
         // Run side effects for new userLivestreamData creations
      }

      if (isUpdate) {
         // Run side effects for userLivestreamData updates
      }

      if (isDelete) {
         // Run side effects for userLivestreamData deletions
      }

      // Run side effects for all userLivestreamData changes
      sideEffectPromises.push(updateLiveStreamStats(change, livestreamId))

      return handleSideEffects(sideEffectPromises)
   })

const handleSideEffects = (sideEffectPromises: Promise<unknown>[]) => {
   return Promise.allSettled(sideEffectPromises).then((results) => {
      results.forEach((result) => {
         if (result.status === "rejected") {
            functions.logger.error(result.reason)
         }
      })
   })
}

const logStart = ({
   message,
   context,
   changeTypes,
}: {
   message: string
   context: functions.EventContext
   changeTypes: ReturnType<typeof getChangeTypes>
}) => {
   functions.logger.info(message, {
      changeTypes,
      params: context.params,
   })
}
