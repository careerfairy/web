import functions = require("firebase-functions")
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group } from "@careerfairy/shared-lib/groups"
import { hasCustomJobsGroupMetaDataChanged } from "@careerfairy/shared-lib/groups/metadata"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { hasMetadataChanged as hasGroupMetadataChanged } from "@careerfairy/shared-lib/livestreams/metadata"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { UserStats } from "@careerfairy/shared-lib/src/users"
import { firestore } from "./api/firestoreAdmin"
import {
   customJobRepo,
   groupRepo,
   livestreamsRepo,
   sparkRepo,
} from "./api/repositories"

import { getArrayDifference } from "@careerfairy/shared-lib/utils"
import _ from "lodash"
import config from "./config"
import { handleUserStatsBadges } from "./lib/badge"
import { rewardSideEffectsUserStats } from "./lib/reward"
import { handleEventStartDateChangeTrigger } from "./lib/sparks/notifications/publicNotifications"
import { removeGroupNotificationsAndSyncSparksNotifications } from "./lib/sparks/notifications/userNotifications"
import { getGroupIdsToBeUpdatedFromChangedEvent } from "./lib/sparks/util"
import {
   defaultTriggerRunTimeConfig,
   handleSideEffects,
   logStart,
} from "./lib/triggers/util"
import { getChangeTypes } from "./util"
import { validateGroupSparks } from "./util/sparks"

export const syncLivestreams = functions
   .runWith({ ...defaultTriggerRunTimeConfig, memory: "1GB" })
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

         // We must delete all notifications for this event's groupIds because of the Notification creation process.
         // Check comment of mapEventsToNotifications.
         const groupIdsToBeUpdatedFromNotifications =
            getGroupIdsToBeUpdatedFromChangedEvent(previousValue, newValue)

         if (newValue.hasStarted && !previousValue.hasStarted) {
            // In case the livestream as started we want to update the sparks notifications
            functions.logger.log(
               `Event ${newValue.id} has started, as result, spark notification associated with this event will be deleted`
            )

            groupIdsToBeUpdatedFromNotifications.forEach((groupId) => {
               sideEffectPromises.push(
                  removeGroupNotificationsAndSyncSparksNotifications(
                     firestore,
                     functions.logger.log,
                     groupId
                  )
               )
            })

            // Notify every registered user of the live stream start
            sideEffectPromises.push(
               livestreamsRepo.createLivestreamStartUserNotifications(newValue)
            )
         }

         if (newValue.startDate !== previousValue.startDate) {
            groupIdsToBeUpdatedFromNotifications.forEach((groupId) => {
               sideEffectPromises.push(
                  handleEventStartDateChangeTrigger(
                     newValue,
                     previousValue,
                     groupId,
                     functions.logger.log
                  )
               )
            })
         }
      }

      if (changeTypes.isDelete) {
         const deletedValue = change.before?.data() as LivestreamEvent

         sideEffectPromises.push(
            customJobRepo.removeLinkedLivestream(deletedValue.id)
         )
      }

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

      const newValue = change.after?.data() as Group
      const previousValue = change.before?.data() as Group

      if (changeTypes.isUpdate) {
         // In case the publicProfile flag changes we must validate the group sparks

         if (newValue.publicProfile !== previousValue.publicProfile) {
            sideEffectPromises.push(validateGroupSparks(newValue))
         }
      }

      if (changeTypes.isUpdate || changeTypes.isCreate) {
         // In case any of the backfills change

         if (hasGroupMetadataChanged(previousValue, newValue)) {
            sideEffectPromises.push(
               livestreamsRepo.syncLivestreamMetadata(groupId, newValue)
            )
         }

         if (hasCustomJobsGroupMetaDataChanged(previousValue, newValue)) {
            sideEffectPromises.push(
               customJobRepo.syncCustomJobDataGroupMetaData(groupId, newValue)
            )
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
            (!beforeData.published &&
               afterData.published &&
               afterData.group.publicSparks) ||
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
   .firestore.document("customJobs/{jobId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncCustomJobsOnWrite",
      })

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      const newCustomJob = change.after.data() as CustomJob
      const oldCustomJob = change.before.data() as CustomJob

      const businessFunctionTagsChanged = Boolean(
         _.xor(
            newCustomJob.businessFunctionsTagIds ?? [],
            oldCustomJob.businessFunctionsTagIds ?? []
         ).length
      )

      const hasLinkedSparks = Boolean(newCustomJob.sparks.length)

      if (changeTypes.isCreate) {
         sideEffectPromises.push(
            customJobRepo.createCustomJobStats(newCustomJob)
         )
      }

      // Run side effects for all custom jobs changes
      if (changeTypes.isUpdate) {
         sideEffectPromises.push(
            customJobRepo.syncCustomJobDataToCustomJobStats(newCustomJob),
            customJobRepo.syncCustomJobDataToJobApplications(newCustomJob)
         )
      }

      if (changeTypes.isDelete) {
         const deletedCustomJob = change.before.data() as CustomJob

         sideEffectPromises.push(
            customJobRepo.syncDeletedCustomJobDataToCustomJobStats(
               deletedCustomJob
            ),
            customJobRepo.syncDeletedCustomJobDataToJobApplications(
               deletedCustomJob
            )
         )

         if (deletedCustomJob.sparks.length) {
            sideEffectPromises.push(
               sparkRepo.syncCustomJobBusinessFunctionTagsToSparks(
                  deletedCustomJob.sparks,
                  []
               )
            )
         }
      }

      sideEffectPromises.push(
         livestreamsRepo.syncCustomJobBusinessFunctionTagsToLivestreams(
            newCustomJob,
            oldCustomJob,
            changeTypes
         )
      )

      /**
       * Cascade the businessFunctionsTagIds down to the Sparks and Live streams upon the only when the customJob
       * has linked content (Sparks or Live streams), and there has been a change to the content link or to the business function tags.
       */
      if (changeTypes.isUpdate || changeTypes.isCreate) {
         const removedSparks = getArrayDifference(
            newCustomJob.sparks ?? [],
            oldCustomJob.sparks ?? []
         ) as string[]

         const linkedSparksChanged = Boolean(
            _.xor(newCustomJob.sparks ?? [], oldCustomJob.sparks ?? []).length
         )

         if (removedSparks.length) {
            sideEffectPromises.push(
               sparkRepo.syncCustomJobBusinessFunctionTagsToSparks(
                  removedSparks,
                  []
               )
            )
         }

         if (hasLinkedSparks) {
            if (linkedSparksChanged || businessFunctionTagsChanged) {
               sideEffectPromises.push(
                  sparkRepo.syncCustomJobBusinessFunctionTagsToSparks(
                     newCustomJob.sparks,
                     newCustomJob.businessFunctionsTagIds
                  )
               )
            }
         }
      }

      return handleSideEffects(sideEffectPromises)
   })
