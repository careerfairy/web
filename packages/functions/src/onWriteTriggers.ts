import functions = require("firebase-functions")
import { groupRepo, livestreamsRepo, sparkRepo } from "./api/repositories"
import { getChangeTypes } from "./util"
import {
   handleSideEffects,
   logStart,
   defaultTriggerRunTimeConfig,
} from "./lib/triggers/util"
import config from "./config"
import { rewardSideEffectsUserStats } from "./lib/reward"
import { handleUserStatsBadges } from "./lib/badge"
import { UserStats } from "@careerfairy/shared-lib/src/users"

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
   .firestore.document("livestreams/{livestreamId}/stats/livestreamStats")
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

export const syncUserStats = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("userData/{userEmail}/stats/stats")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)
      const userEmail = context.params.userEmail

      logStart({
         changeTypes,
         context,
         message: "syncUserStatsOnWrite",
      })

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all livestreamStats changes
      sideEffectPromises.push(rewardSideEffectsUserStats(userEmail, change))
      sideEffectPromises.push(
         handleUserStatsBadges(userEmail, change.after.data() as UserStats)
      )

      return handleSideEffects(sideEffectPromises)
   })

export const onWriteCreator = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("careerCenterData/{groupId}/creators/{creatorId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncUserStatsOnWrite",
      })

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all creator changes
      sideEffectPromises.push(sparkRepo.syncCreatorDataToSpark(change))

      return handleSideEffects(sideEffectPromises)
   })

export const onWriteGroup = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("careerCenterData/{groupId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      // We need the groupId from here since some groups don't have an id field
      const groupId = context.params.groupId

      logStart({
         changeTypes,
         context,
         message: "syncUserStatsOnWrite",
      })

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all creator changes
      sideEffectPromises.push(sparkRepo.syncGroupDataToSpark(change, groupId))

      return handleSideEffects(sideEffectPromises)
   })
