import functions = require("firebase-functions")
import { groupRepo, livestreamsRepo } from "./api/repositories"
import { getChangeTypes } from "./util"
import {
   handleSideEffects,
   logStart,
   defaultTriggerRunTimeConfig,
} from "./lib/triggers/util"
import config = require("./config")

export const syncLivestreams = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
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
   .region(config.region)
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
            functions.logger
         )
      )

      return handleSideEffects(sideEffectPromises)
   })

export const syncLivestreamStats = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}/stats/livestreamStats") // Listens to a single document https://firebase.google.com/docs/functions/firestore-events#specific-documents
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncLivestreamStatsOnWrite",
      })

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all livestreamStats changes
      sideEffectPromises.push(
         groupRepo.addOperationsToGroupStats(change, functions.logger)
      )

      return handleSideEffects(sideEffectPromises)
   })
