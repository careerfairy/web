import functions = require("firebase-functions")
import { livestreamsRepo } from "./api/repositories"
import { getChangeTypes } from "./util"
import {
   handleSideEffects,
   logStart,
   defaultTriggerRunTimeConfig,
} from "./lib/triggers/util"

export const syncLivestreams = functions
   .runWith(defaultTriggerRunTimeConfig)
   .firestore.document("livestreams/{livestreamId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncLivestreamsOnWrite",
      })

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all livestream changes
      sideEffectPromises.push(
         livestreamsRepo.syncLiveStreamStatsWithLivestream(change)
      )

      return handleSideEffects(sideEffectPromises)
   })

export const syncUserLivestreamData = functions
   .runWith(defaultTriggerRunTimeConfig)
   .firestore.document("livestreams/{livestreamId}/userLivestreamData/{userId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncUserLivestreamDataOnWrite",
      })

      const { livestreamId } = context.params

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all userLivestreamData changes
      sideEffectPromises.push(
         livestreamsRepo.addOperationsToLiveStreamStats(
            change,
            livestreamId,
            functions.logger.info
         )
      )

      return handleSideEffects(sideEffectPromises)
   })
