import functions = require("firebase-functions")
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group, pickPublicDataFromGroup } from "@careerfairy/shared-lib/groups"
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
   universityRepo,
   userRepo,
} from "./api/repositories"

import { levelsOfStudyOrderMap } from "@careerfairy/shared-lib/fieldOfStudy"
import { University } from "@careerfairy/shared-lib/universities/universities"
import { DateTime } from "luxon"
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
import { logAndThrow } from "./lib/validations"
import { ChangeType, getChangeTypeEnum, getChangeTypes } from "./util"
import { validateGroupSparks } from "./util/sparks"

export const syncLivestreams = functions
   .runWith({ ...defaultTriggerRunTimeConfig, memory: "2GB" })
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

export const syncLivestreamStartNotifications = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("livestreams/{livestreamId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "handleLivestreamStartNotificationsOnWrite",
      })

      if (changeTypes.isUpdate) {
         const newValue = change.after?.data() as LivestreamEvent
         const previousValue = change.before?.data() as LivestreamEvent

         if (newValue.hasStarted && !previousValue.hasStarted) {
            // Notify every registered user of the live stream start
            return livestreamsRepo.createLivestreamStartUserNotifications(
               newValue
            )
         }
      }

      return null
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

      if (changeTypes.isUpdate) {
         sideEffectPromises.push(
            livestreamsRepo.syncCreatorDataToLivestreamSpeaker(change)
         )
      }

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

export const syncGroupFollowingUserDataOnChange = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("careerCenterData/{groupId}")
   .onWrite(async (change, context) => {
      const changeType = getChangeTypeEnum(change)

      try {
         const groupId = context.params.groupId

         const newValue = change.after?.data() as Group

         // An array of promise side effects to be executed in parallel
         const sideEffectPromises: Promise<unknown>[] = []

         if (
            changeType === ChangeType.UPDATE ||
            changeType === ChangeType.DELETE
         ) {
            const followingUsers = await groupRepo.getFollowingUsers(groupId)

            if (!followingUsers.length) {
               functions.logger.log(
                  `🚀 ~ No following users found for group: ${groupId}. Skipping...`
               )
            } else {
               switch (changeType) {
                  case ChangeType.UPDATE: {
                     functions.logger.log(
                        `🚀 ~ Following users found for group: ${followingUsers.length}. Updating...`
                     )

                     // From comment above @onWriteGroup "We need the groupId from here since some groups don't have an id field"
                     newValue.id = groupId

                     const publicGroup = pickPublicDataFromGroup(newValue)
                     sideEffectPromises.push(
                        userRepo.batchUpdateFollowingUsersGroup(
                           publicGroup,
                           followingUsers
                        )
                     )

                     break
                  }
                  case ChangeType.DELETE: {
                     functions.logger.log(
                        `🚀 ~ Following users found for group: ${followingUsers.length}. Deleting...`
                     )

                     sideEffectPromises.push(
                        userRepo.batchDeleteFollowingUsersGroup(
                           groupId,
                           followingUsers
                        )
                     )

                     break
                  }
               }
            }
         }

         return handleSideEffects(sideEffectPromises)
      } catch (error) {
         logAndThrow(
            `🚀 ~ Error synchronizing group[${context.params.groupId}] data for following users: `,
            error,
            context
         )
      }
   })

export const onWriteSpark = functions
   .runWith({ ...defaultTriggerRunTimeConfig, memory: "512MB" })
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

         // Remove linked jobs
         sideEffectPromises.push(customJobRepo.removeLinkedSpark(sparkId))
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

      if (changeTypes.isCreate) {
         const newCustomJob = change.after.data() as CustomJob
         sideEffectPromises.push(
            customJobRepo.createCustomJobStats(newCustomJob)
         )
      }

      // Run side effects for all custom jobs changes
      if (changeTypes.isUpdate) {
         const updatedCustomJob = change.after.data() as CustomJob

         sideEffectPromises.push(
            customJobRepo.syncCustomJobDataToCustomJobStats(updatedCustomJob),
            customJobRepo.syncCustomJobDataToJobApplications(updatedCustomJob)
         )

         if (updatedCustomJob.isPermanentlyExpired) {
            sideEffectPromises.push(
               customJobRepo.syncDeletedCustomJobDataToJobApplications(
                  updatedCustomJob
               ),
               customJobRepo.syncDeletedCustomJobToLinkedLivestreams(
                  updatedCustomJob
               ),
               customJobRepo.syncDeletedCustomJobToLinkedSparks(
                  updatedCustomJob
               )
            )
         }
      }

      if (changeTypes.isDelete) {
         const deletedCustomJob = change.before.data() as CustomJob

         sideEffectPromises.push(
            customJobRepo.syncDeletedCustomJobDataToCustomJobStats(
               deletedCustomJob
            ),
            customJobRepo.syncDeletedCustomJobDataToJobApplications(
               deletedCustomJob
            ),
            customJobRepo.syncDeletedCustomJobToLinkedLivestreams(
               deletedCustomJob
            ),
            customJobRepo.syncDeletedCustomJobToLinkedSparks(deletedCustomJob),
            sparkRepo.syncCustomJobBusinessFunctionTagsToSparks(
               deletedCustomJob,
               deletedCustomJob,
               changeTypes
            ),
            livestreamsRepo.syncCustomJobBusinessFunctionTagsToLivestreams(
               deletedCustomJob,
               deletedCustomJob,
               changeTypes
            )
         )
      }

      if (changeTypes.isCreate || changeTypes.isUpdate) {
         const newCustomJob = change.after.data() as CustomJob
         const oldCustomJob = change.before.data() as CustomJob

         sideEffectPromises.push(
            livestreamsRepo.syncCustomJobBusinessFunctionTagsToLivestreams(
               newCustomJob,
               oldCustomJob,
               changeTypes
            ),
            sparkRepo.syncCustomJobBusinessFunctionTagsToSparks(
               newCustomJob,
               oldCustomJob,
               changeTypes
            ),
            livestreamsRepo.syncGroupLivestreamsHasJobsFlag(
               newCustomJob,
               oldCustomJob
            ),
            sparkRepo.syncGroupSparksHasJobsFlag(newCustomJob, oldCustomJob)
         )
      }

      return handleSideEffects(sideEffectPromises)
   })

export const onWriteCustomJobsSendNotifications = functions
   .runWith({ ...defaultTriggerRunTimeConfig, memory: "1GB" })
   .region(config.region)
   .firestore.document("customJobs/{jobId}")
   .onWrite(async (change, context) => {
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncCustomJobsNotificationsOnWrite",
      })

      // An array of promise side effects to be executed in parallel
      const sideEffectPromises: Promise<unknown>[] = []

      if (changeTypes.isCreate || changeTypes.isUpdate) {
         const newCustomJob = change.after.data() as CustomJob
         const oldCustomJob = change.before.data() as CustomJob

         if (!oldCustomJob?.published && newCustomJob?.published) {
            sideEffectPromises.push(
               customJobRepo.createNewCustomJobUserNotifications(newCustomJob)
            )
         } else {
            functions.logger.log(
               `${newCustomJob.id} job update was not newly published. Skipping notifications.`
            )
         }
      }

      return handleSideEffects(sideEffectPromises)
   })

export const onWriteStudyBackground = functions
   .runWith(defaultTriggerRunTimeConfig)
   .region(config.region)
   .firestore.document("userData/{userId}/studyBackgrounds/{studyBackgroundId}")
   .onWrite(async (change, context) => {
      const { userId } = context.params
      const changeTypes = getChangeTypes(change)

      logStart({
         changeTypes,
         context,
         message: "syncStudyBackgroundOnWrite",
      })

      // Get current study backgrounds
      const allUserStudyBackgrounds =
         (await userRepo.getUserStudyBackgrounds(userId)) || []

      // If its delete we need to remove the study background from the user
      // before calculating the effective study background
      const userStudyBackgrounds =
         changeTypes.isCreate || changeTypes.isUpdate
            ? allUserStudyBackgrounds
            : allUserStudyBackgrounds.filter(
                 (studyBackground) => studyBackground.id !== change.before.id
              )

      // Sort the study backgrounds by the endedAt date and then by the level of study
      const sortedStudyBackgrounds = userStudyBackgrounds.sort((a, b) => {
         if (!a.endedAt) {
            return 1
         }

         if (!b.endedAt) {
            return -1
         }

         const aDate = DateTime.fromJSDate(a.endedAt?.toDate()).startOf("month")
         const bDate = DateTime.fromJSDate(b.endedAt?.toDate()).startOf("month")

         if (aDate.equals(bDate)) {
            return (
               levelsOfStudyOrderMap[b.levelOfStudy.id] -
               levelsOfStudyOrderMap[a.levelOfStudy.id]
            )
         }

         return bDate > aDate ? 1 : -1
      })

      // If there are no study backgrounds, we need to update the user data to remove the study background
      if (!sortedStudyBackgrounds.length) {
         await userRepo.updateUserData(userId, {
            fieldOfStudy: null,
            levelOfStudy: null,
            universityCountryCode: null,
            university: null,
            studyBackgroundStartedAt: null,
            studyBackgroundEndedAt: null,
         })
      } else {
         // If there are study backgrounds, we need to update the user data to the first effective study background
         const effectiveStudyBackground = sortedStudyBackgrounds.at(0)

         functions.logger.log(
            "🚀 ~ Effective study background:",
            userId,
            effectiveStudyBackground
         )

         effectiveStudyBackground.universityId =
            effectiveStudyBackground.universityId
               ? effectiveStudyBackground.universityId
               : "other"

         const university: University =
            effectiveStudyBackground.universityId.toLocaleLowerCase() ===
            "other"
               ? {
                    id: "other",
                    name: "Other",
                 }
               : await universityRepo.getUniversityById(
                    effectiveStudyBackground.universityCountryCode,
                    effectiveStudyBackground.universityId
                 )

         functions.logger.log("🚀 ~ Effective university:", userId, university)

         await userRepo.updateUserData(userId, {
            fieldOfStudy: effectiveStudyBackground.fieldOfStudy,
            levelOfStudy: effectiveStudyBackground.levelOfStudy,
            universityCountryCode:
               effectiveStudyBackground.universityCountryCode,
            university: {
               ...university,
               code: university.id,
            },
            studyBackgroundStartedAt: effectiveStudyBackground.startedAt,
            studyBackgroundEndedAt: effectiveStudyBackground.endedAt,
         })
      }
   })
