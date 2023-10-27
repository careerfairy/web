import functions = require("firebase-functions")
import {
   groupRepo,
   livestreamsRepo,
   sparkRepo,
   userRepo,
} from "./api/repositories"
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
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { removeAndSyncSparksNotifications } from "./notificationSparks"
import { Group } from "@careerfairy/shared-lib/groups"
import { validateGroupSparks } from "./util/sparks"

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

      if (changeTypes.isUpdate) {
         const newValue = change.after?.data() as LivestreamEvent
         const previousValue = change.before?.data() as LivestreamEvent

         if (newValue.hasStarted && !previousValue.hasStarted) {
            // In case the livestream as started we want to update the sparks notifications
            functions.logger.log(
               `Event ${newValue.id} has started, as result, spark notification associated with this event will be deleted`
            )
            sideEffectPromises.push(
               removeAndSyncSparksNotifications(
                  newValue.author?.groupId || newValue.groupIds?.[0]
               )
            )
         }
      }

      sideEffectPromises.push(groupRepo.syncLivestreamIdWithCustomJobs(change))

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
         message: "syncGroupOnWrite",
      })

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all creator changes
      sideEffectPromises.push(sparkRepo.syncGroupDataToSpark(change, groupId))

      if (changeTypes.isUpdate) {
         // In case the publicProfile flag changes we must validate the group sparks
         const newValue = change.after?.data() as Group
         const previousValue = change.before?.data() as Group

         if (newValue.publicProfile !== previousValue.publicProfile) {
            sideEffectPromises.push(validateGroupSparks(newValue))
         }
      }

      return handleSideEffects(sideEffectPromises)
   })

export const onWriteSpark = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("sparks/{sparkId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      // We need the groupId from here since some groups don't have an id field
      const sparkId = context.params.sparkId

      logStart({
         changeTypes,
         context,
         message: "syncSparkOnWrite",
      })

      const afterData = {
         ...change.after.data(),
         id: sparkId,
      } as Spark

      const beforeData = {
         ...change.before?.data(),
         id: sparkId,
      } as Spark

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      if (changeTypes.isDelete) {
         // Remove spark from all user feeds
         sideEffectPromises.push(sparkRepo.removeSparkFromAllUserFeeds(sparkId))
      }

      if (changeTypes.isUpdate || changeTypes.isCreate) {
         sideEffectPromises.push(
            sparkRepo.syncSparkToSparkStatsDocument(afterData)
         )

         if (
            (!beforeData.published && afterData.published) ||
            (!beforeData?.group?.publicSparks && afterData.group.publicSparks)
         ) {
            // This notification will be triggered only when either the 'publicSparks' flag on the Group document
            // or the 'published' flag on the Sparks is changed from disable to active
            sideEffectPromises.push(
               sparkRepo.createSparkUserNotification(afterData)
            )
         }
      }

      if (changeTypes.isCreate) {
         // Add spark to user feeds
         sideEffectPromises.push(sparkRepo.addSparkToAllUserFeeds(afterData))
      }

      if (changeTypes.isUpdate) {
         // Update spark in user feeds
         sideEffectPromises.push(sparkRepo.updateSparkInAllUserFeeds(afterData))
      }

      return handleSideEffects(sideEffectPromises)
   })

export const onWriteCustomJobs = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("careerCenterData/{groupId}/customJobs/{jobId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncCustomJobsOnWrite",
      })

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      // Run side effects for all custom jobs changes
      sideEffectPromises.push(
         livestreamsRepo.syncCustomJobDataToLivestream(change),
         userRepo.syncCustomJobDataToUser(change)
      )

      return handleSideEffects(sideEffectPromises)
   })
