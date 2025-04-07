import BaseFirebaseRepository from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Group, pickPublicDataFromGroup } from "@careerfairy/shared-lib/groups"
import {
   Creator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import {
   SerializedSpark,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import {
   AddSparkSparkData,
   DeletedSpark,
   SeenSparks,
   Spark,
   SparkCategoriesToTagValuesMapper,
   SparkStats,
   TagValuesToSparkCategoriesMapper,
   UpdateSparkData,
   UserSparksFeedMetrics,
   createSeenSparksDocument,
   getCategoryById,
} from "@careerfairy/shared-lib/sparks/sparks"
import {
   SparkEvent,
   SparkInteractionSources,
   SparkSecondWatched,
} from "@careerfairy/shared-lib/sparks/telemetry"
import {
   Identifiable,
   OptionGroup,
} from "@careerfairy/shared-lib/src/commonTypes"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import { getArrayDifference } from "@careerfairy/shared-lib/utils"
import { DocumentSnapshot } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { Change } from "firebase-functions"
import { DateTime } from "luxon"
import {
   FieldValue,
   Firestore,
   Storage,
   Timestamp,
} from "../../api/firestoreAdmin"
import {
   customJobRepo,
   livestreamsRepo,
   sparkRepo,
   userRepo,
} from "../../api/repositories"
import { FunctionsLogger, getChangeTypes } from "../../util"
import { createGenericConverter } from "../../util/firestore-admin"
import { addAddedToFeedAt } from "../../util/sparks"
import BigQueryCreateInsertService from "../bigQuery/BigQueryCreateInsertService"
import SparkRecommendationService from "../recommendation/SparkRecommendationService"
import { SparksDataFetcher } from "../recommendation/services/DataFetcherRecommendations"
import { syncCustomJobLinkedContentTags } from "../tagging/tags"
import { logAndThrow } from "../validations"
import { SparksFeedReplenisher } from "./sparksFeedReplenisher"

export interface ISparkFunctionsRepository {
   /**
    *  Get a spark
    * @param id  The id of the spark
    */
   get(id: string): Promise<Spark | null>

   /**
    *  Deletes a spark and moves it to the deletedSparks collection
    * @param id  The id of the spark
    */
   delete(id: string): Promise<void>

   /**
    *  Create a spark
    * @param spark  The spark to create
    * @param group
    * @param creator
    */
   create(
      spark: AddSparkSparkData,
      group: Group,
      creator: Creator
   ): Promise<void>

   /**
    *  Update a spark
    * @param spark  The spark to update
    * @param creator  The creator of the spark
    */
   update(spark: UpdateSparkData, creator: Creator): Promise<void>

   /**
    * Sync creator data to the spark
    */
   syncCreatorDataToSpark(creator: Change<DocumentSnapshot>): Promise<void>

   /**
    * Sync group data to the spark
    * @param group  The group to sync
    * @param groupId  The id of the group since some group DocumentSnapshots don't have an id field
    */
   syncGroupDataToSpark(
      group: Change<DocumentSnapshot>,
      groupId: string
   ): Promise<void>

   /**
    * Generates a feed of sparks for a user
    * - TODO: Should be replaced with recommendation engine dependency injection in the future
    * @param userId  The id of the user
    * @returns The user feed
    */
   generateSparksFeed(userId: string): Promise<SerializedSpark[]>

   /**
    * Gets a user's feed
    * @param userId The id of the user
    * @returns The user feed
    * - If the user doesn't have a feed, it will lazily generate one and store it in the database
    */
   getUserFeedMetrics(userId: string): Promise<UserSparksFeedMetrics>

   /**
    * Get the user's feed of Sparks
    * @param userId ${userId} The id of the user
    * @param limit ${limit} The number of sparks to fetch (default: 10)
    *
    * - If the user doesn't have a feed, it will lazily generate one and store it in the database, then return it
    */
   getUserSparksFeed(userId: string, limit?: number): Promise<SerializedSpark[]>

   /**
    * Get the public feed of Sparks
    * @param limit ${limit} The number of sparks to fetch (default: 10)
    */
   getPublicSparksFeed(
      contentTopics?: string[],
      limit?: number,
      countryCode?: OptionGroup
   ): Promise<SerializedSpark[]>

   /**
    * Get the group's feed of Sparks
    * @param groupId ${groupId} The id of the group
    * @param limit ${limit} The number of sparks to fetch (default: 10)
    */
   getGroupSparksFeed(
      groupId: string,
      contentTopics?: string[],
      limit?: number
   ): Promise<SerializedSpark[]>

   /**
    * Get the group's feed of Sparks without a creator
    * @param groupId ${groupId} The id of the group
    * @param limit ${limit} The number of sparks to fetch (default: 10)
    */
   getGroupSparksFeedWithoutCreator(
      groupId: string,
      creatorId: string,
      limit?: number
   ): Promise<SerializedSpark[]>

   /**
    * Get the creator's feed of Sparks
    * @param creatorId ${creatorId} The id of the creator
    * @param limit ${limit} The number of sparks to fetch (default: 10)
    */
   getCreatorSparksFeed(
      creatorId: string,
      limit?: number
   ): Promise<SerializedSpark[]>

   /**
    * Method to replenish a user's feed, when the number of sparks in the feed is less than x
    * @param userId The id of the user
    */
   replenishUserFeed(userId: string): Promise<void>

   /**
    * Marks a spark as seen for a user.
    * @param userId The ID of the user.
    * @param sparkId The ID of the spark.
    */
   markSparkAsSeenByUser(userId: string, sparkId: string): Promise<void>

   /**
    * Checks if a user has seen a particular spark.
    * @param userId The ID of the user.
    * @param sparkId The ID of the spark.
    * @returns Boolean indicating if the spark has been seen by the user.
    */
   hasUserSeenSpark(userId: string, sparkId: string): Promise<boolean>

   /**
    * Removes a spark from a user's feed
    * @param userId The ID of the user.
    * @param sparkId The ID of the spark.
    * @returns void
    */
   removeSparkFromUserFeed(userId: string, sparkId: string): Promise<void>

   /**
    * Removes a spark from all user feeds
    * @param sparkId The ID of the spark.
    * @returns void
    */
   removeSparkFromAllUserFeeds(sparkId: string): Promise<void>

   /**
    * Adds a spark to all user feeds if the spark is public
    * @param spark The spark to add.
    * @returns void
    */
   addSparkToAllUserFeeds(spark: Spark): Promise<void>

   /**
    * Updates a spark in all user feeds. If the spark is no longer public, it will be deleted from all user feeds.
    * @param spark The spark to update.
    * @returns void
    */
   updateSparkInAllUserFeeds(spark: Spark): Promise<void>

   /**
    * Increment/Decrement the sparks feed count for a user
    * @param userId The ID of the user.
    * @param type
    * @returns void
    */
   incrementFeedCount(
      userId: string,
      type: "increment" | "decrement"
   ): Promise<void>

   getSparksByGroupId(groupId: string): Promise<Spark[]>

   /**
    * Get all published sparks for a group
    * @param groupId The id of the group
    * @returns An array of published sparks
    */
   getPublishedSparksByGroupId(groupId: string): Promise<Spark[]>

   groupHasPublishedSparks(groupId: string, limit?: number): Promise<boolean>
   /**
    * Get all user sparks feed metrics
    *
    */
   getAllUserSparksFeedMetrics(): Promise<UserSparksFeedMetrics[]>

   /**
    * Remove all spark notifications related to a specific group
    *
    */
   removeAllSparkNotificationsByGroup(groupId: string): Promise<void>

   /**
    * Remove specific spark notifications from a single user
    *
    */
   removeUserSparkNotification(userId: string, groupId: string): Promise<void>

   /**
    * Get all User Spark Notification
    *
    */
   getUserSparkNotifications(userId: string): Promise<UserSparksNotification[]>

   /**
    * Save spark events to BigQuery
    * @param events The spark events to save
    * @returns void
    */
   trackSparkEvents(events: SparkEvent[]): Promise<void>

   /**
    * Save spark seconds watched to BigQuery
    * @param events The spark seconds watched to save
    * @returns void
    */
   trackSparkSecondsWatched(events: SparkSecondWatched[]): Promise<void>

   /**
    * Embed spark on the newly created spark stats document
    * @param sparkId The spark id to fetch and embed
    * @param snapshot The spark stats document snapshot
    * @returns void
    */
   addSparkToSparkStatsDocument(
      sparkId: string,
      snapshot: DocumentSnapshot
   ): Promise<void>

   /**
    * Syncs a spark to the spark stats document
    * @param spark The spark to sync
    * @returns void
    */
   syncSparkToSparkStatsDocument(spark: Spark): Promise<void>

   /**
    * Create spark notification
    * @param spark
    */
   createSparkUserNotification(spark: Spark): Promise<void>

   /**
    * Get sparks for a user based on interactions
    * @param userId The user id
    * @param subCollectionName The user's sub collection name
    * @returns Promise of an array of SeenSparks
    */
   getUserSparkInteraction<T extends Identifiable>(
      userId: string,
      subCollectionName: string
   ): Promise<T[]>

   /**
    * Get sparks by their ids
    * @param sparkIds The array of spark ids
    * @returns Promise of an array of Spark
    */
   getSparksByIds(sparkIds: string[]): Promise<Spark[]>

   /**
    * Synchronizes the the business function tags from a customJob, to all the associated
    * sparks, also updates the tags on sparks which were removed from the jobs.
    * This means fetching all other jobs for the unlinked sparks, and keep for that spark only
    * the other jobs tags.
    * @param afterJob customJob after update
    * @param beforeJob customJob before data update
    */
   syncCustomJobBusinessFunctionTagsToSparks(
      afterJob: CustomJob,
      beforeJob: CustomJob,
      changeType: ReturnType<typeof getChangeTypes>
   ): Promise<void>

   /**
    * Synchronizes the 'hasJobs' flag for group sparks based on the changes in the custom job.
    * This function updates the 'hasJobs' flag for sparks associated with the custom job.
    * @param afterJob The custom job after the update.
    * @param beforeJob The custom job before the update.
    */
   syncGroupSparksHasJobsFlag(
      afterJob: CustomJob,
      beforeJob: CustomJob
   ): Promise<void>
}

export class SparkFunctionsRepository
   extends BaseFirebaseRepository
   implements ISparkFunctionsRepository
{
   constructor(
      readonly firestore: Firestore,
      readonly storage: Storage,
      readonly logger: FunctionsLogger,
      readonly feedReplenisher: SparksFeedReplenisher,
      readonly sparkEventHandler: BigQueryCreateInsertService<SparkEvent>,
      readonly sparkSecondsWatchedHandler: BigQueryCreateInsertService<SparkSecondWatched>
   ) {
      super()
   }

   private readonly TARGET_SPARK_COUNT = 30 // The number of sparks a user's feed should have

   async get(id: string): Promise<Spark | null> {
      const doc = await this.firestore
         .collection("sparks")
         .withConverter<Spark>(createGenericConverter())
         .doc(id)
         .get()

      return doc.exists ? doc.data() : null
   }

   async delete(id: string): Promise<void> {
      // Get the references
      const sparkRef = this.firestore.collection("sparks").doc(id)
      const sparkDeletedRef = this.firestore.collection("deletedSparks").doc(id)
      const sparkStatsRef = this.firestore.collection("sparkStats").doc(id)

      // Get the document
      const sparkSnap = await sparkRef.get()
      const sparkData = sparkSnap.data() as Spark

      if (!sparkSnap.exists) {
         throw new Error("Spark does not exist")
      }

      const batch = this.firestore.batch()

      // Delete the spark document
      batch.delete(sparkRef)

      // Create a spark new document in the deleted collection
      const deletedSpark: DeletedSpark = {
         ...sparkData,
         deletedAt: Timestamp.now(),
      }

      // Add deletedAt to the spark stats document

      const updatedSParkStats: Pick<SparkStats, "deletedAt" | "deleted"> = {
         deleted: true,
         deletedAt: Timestamp.now(),
      }

      batch.set(sparkDeletedRef, deletedSpark)

      // Create a spark stats new document in the deleted collection
      batch.set(sparkStatsRef, updatedSParkStats, {
         merge: true,
      })

      // Delete the files in storage
      this.deleteSparkFiles(sparkData).catch(this.logger.error)

      return void batch.commit()
   }

   async create(
      data: AddSparkSparkData,
      group: Group,
      creator: Creator
   ): Promise<void> {
      const ref = this.firestore.collection("sparks").doc()
      const doc: Spark = {
         question: data.question,
         video: data.video,
         category: getCategoryById(data.categoryId),
         contentTopicsTagIds:
            [SparkCategoriesToTagValuesMapper[data.categoryId]] ?? [],
         createdAt: Timestamp.now(),
         publishedAt: data.published ? Timestamp.now() : null,
         updatedAt: null,
         addedToFeedAt: null,
         published: data.published,
         group: pickPublicDataFromGroup(group),
         creator: pickPublicDataFromCreator(creator),
         id: ref.id,
      }

      return void ref.set(doc)
   }

   async update(data: UpdateSparkData, creator: Creator): Promise<void> {
      const doc: Pick<
         Spark,
         | "category"
         | "contentTopicsTagIds"
         | "creator"
         | "question"
         | "published"
         | "updatedAt"
         | "publishedAt"
         | "id"
      > = {
         question: data.question,
         category: getCategoryById(data.categoryId),
         contentTopicsTagIds:
            [SparkCategoriesToTagValuesMapper[data.categoryId]] ?? [],
         updatedAt: Timestamp.now(),
         published: data.published,
         creator: pickPublicDataFromCreator(creator),
         ...(data.published && {
            publishedAt: Timestamp.now(),
         }),
         id: data.id,
      }

      return void this.firestore.collection("sparks").doc(data.id).update(doc)
   }

   private async deleteSparkFiles(spark: Spark): Promise<void> {
      const bucket = this.storage.bucket()

      await bucket
         .file(`sparks/videos/${spark.video.uid}.${spark.video.fileExtension}`)
         .delete(deleteOptions)

      return
   }

   async syncCreatorDataToSpark(
      creatorChange: Change<DocumentSnapshot<Creator>>
   ): Promise<void> {
      if (!creatorChange.after.exists) {
         // Creator was deleted, so we don't need to update the sparks
         // unless we want to remove the creator data from the sparks
         return
      }

      const newCreator = creatorChange.after.data()

      const sparksSnap = await this.firestore
         .collection("sparks")
         .where("creator.id", "==", newCreator.id)
         .get()

      const batch = this.firestore.batch()

      const toUpdate: Pick<Spark, "creator"> = {
         creator: pickPublicDataFromCreator(newCreator),
      }

      sparksSnap.forEach((doc) => {
         batch.update(doc.ref, toUpdate)
      })

      return void batch.commit()
   }

   async syncGroupDataToSpark(
      groupChange: Change<DocumentSnapshot>,
      groupId: string
   ): Promise<void> {
      if (!groupChange.after.exists) {
         // Group was deleted, so we don't need to update the sparks
         // unless we want to remove the group data from the sparks
         return
      }

      const newGroup = {
         ...groupChange.after.data(),
         id: groupChange.after.id,
      } as Group

      const sparksSnap = await this.firestore
         .collection("sparks")
         .where("group.id", "==", groupId)
         .get()

      const batch = this.firestore.batch()

      const toUpdate: Pick<Spark, "group"> = {
         group: pickPublicDataFromGroup(newGroup),
      }

      sparksSnap.forEach((doc) => {
         batch.update(doc.ref, toUpdate)
      })

      return void batch.commit()
   }

   async generateSparksFeed(userId: string): Promise<SerializedSpark[]> {
      const batch = this.firestore.batch()

      const dataFetcher = new SparksDataFetcher(
         userId,
         livestreamsRepo,
         userRepo,
         sparkRepo
      )

      const [studyBackgrounds, recommendationService] = await Promise.all([
         userRepo.getUserStudyBackgrounds(userId),
         SparkRecommendationService.create(dataFetcher),
      ])

      recommendationService.setStudyBackgrounds(studyBackgrounds)

      const recommendedSparkIds =
         await recommendationService.getRecommendations(this.TARGET_SPARK_COUNT)

      const recommendedSparks = await sparkRepo.getSparksByIds(
         recommendedSparkIds
      )

      // Store in UserFeed
      const userFeed: Omit<UserSparksFeedMetrics, "numberOfSparks"> = {
         id: userId,
         userId,
         lastReplenished: Timestamp.now(),
         replenishStatus: "finished",
      }

      const feedRef = this.firestore.collection("sparksFeedMetrics").doc(userId)

      batch.set(feedRef, userFeed, { merge: true })

      // Store in UserFeed
      recommendedSparks.forEach((spark) => {
         const sparkRef = this.firestore
            .collection("userData")
            .doc(userId)
            .collection("sparksFeed")
            .doc(spark.id)

         addAddedToFeedAt(spark)

         batch.set(sparkRef, spark, { merge: true })
      })

      await batch.commit()

      return recommendedSparks.map(SparkPresenter.serialize)
   }

   async getUserSparksFeed(
      userId: string,
      limit = 10
   ): Promise<SerializedSpark[]> {
      const query = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("sparksFeed")
         .where("group.publicSparks", "==", true)

      const userFeedRef = query
         .orderBy("publishedAt", "desc")
         .limit(limit)
         .withConverter<Spark>(createGenericConverter())

      const userFeedSnap = await userFeedRef.get()

      // If the user doesn't have a feed, we will generate one
      if (userFeedSnap.empty) {
         return this.generateSparksFeed(userId)
      }

      return userFeedSnap.docs.map((doc) =>
         SparkPresenter.serialize(doc.data())
      )
   }

   async getPublicSparksFeed(
      contentTopics: string[],
      limit = 10,
      countryCode: OptionGroup
   ): Promise<SerializedSpark[]> {
      try {
         let query = this.firestore
            .collection("sparks")
            .where("group.publicSparks", "==", true)

         if (contentTopics?.length) {
            // The mapping between content topics and spark categories is 1:1
            query = query.where(
               "category.id",
               "==",
               TagValuesToSparkCategoriesMapper[contentTopics[0]]
            )
         }

         // If no country code is provided, fetch all public sparks
         if (!countryCode) {
            const publicFeedRef = query
               .orderBy("publishedAt", "desc")
               .limit(limit)
               .withConverter<Spark>(createGenericConverter())

            const publicFeedSnap = await publicFeedRef.get()

            return publicFeedSnap.docs.map((doc) =>
               SparkPresenter.serialize(doc.data())
            )
         }

         // Apply country code filter only if content topics are not provided
         if (!contentTopics?.length) {
            // If a country code is provided, prioritize sparks targeted to that country first
            query = query.where(
               "group.targetedCountries",
               "array-contains",
               countryCode
            )
         }

         const publicFeedRef = query
            .orderBy("publishedAt", "desc")
            .limit(limit)
            .withConverter<Spark>(createGenericConverter())

         const publicFeedSnap = await publicFeedRef.get()

         const sparksFeedCandidates = publicFeedSnap.docs.map((doc) =>
            SparkPresenter.serialize(doc.data())
         )

         if (sparksFeedCandidates.length < limit) {
            const publicFeedRef = this.firestore
               .collection("sparks")
               .where("group.publicSparks", "==", true)
               .orderBy("publishedAt", "desc")
               .limit(limit)
               .withConverter<Spark>(createGenericConverter())

            const publicFeedSnap = await publicFeedRef.get()

            const publicSparks = publicFeedSnap.docs.map((doc) =>
               SparkPresenter.serialize(doc.data())
            )

            if (sparksFeedCandidates.length === 0) {
               return publicSparks
            }

            const publicSparksWithoutDuplicates = publicSparks.filter((spark) =>
               sparksFeedCandidates.some(
                  (targetedSpark) => targetedSpark.id !== spark.id
               )
            )

            const result = [
               ...sparksFeedCandidates,
               ...publicSparksWithoutDuplicates,
            ].slice(0, limit)

            return result
         }

         return sparksFeedCandidates
      } catch (error) {
         functions.logger.error(error)
         return []
      }
   }

   async getGroupSparksFeed(
      groupId: string,
      contentTopics: string[],
      limit = 10
   ): Promise<SerializedSpark[]> {
      let query = this.firestore
         .collection("sparks")
         .where("group.id", "==", groupId)
         .where("group.publicSparks", "==", true)

      if (contentTopics?.length) {
         query = query.where(
            "contentTopicsTagIds",
            "array-contains-any",
            contentTopics
         )
      }

      const groupFeedRef = query
         .orderBy("publishedAt", "desc")
         .limit(limit)
         .withConverter<Spark>(createGenericConverter())

      const groupFeedSnap = await groupFeedRef.get()

      return groupFeedSnap.docs.map((doc) =>
         SparkPresenter.serialize(doc.data())
      )
   }

   async getCreatorSparksFeed(
      creatorId: string,
      limit = 10
   ): Promise<SerializedSpark[]> {
      const query = this.firestore
         .collection("sparks")
         .where("creator.id", "==", creatorId)
         .where("group.publicSparks", "==", true)
         .orderBy("publishedAt", "desc")
         .limit(limit)
         .withConverter<Spark>(createGenericConverter())

      const creatorFeedSnap = await query.get()

      return creatorFeedSnap.docs.map((doc) =>
         SparkPresenter.serialize(doc.data())
      )
   }

   async getGroupSparksFeedWithoutCreator(
      groupId: string,
      creatorId: string,
      limit = 10
   ): Promise<SerializedSpark[]> {
      const query = this.firestore
         .collection("sparks")
         .where("group.id", "==", groupId)
         .where("creator.id", "!=", creatorId)
         .where("group.publicSparks", "==", true)
         .orderBy("creator.id", "asc")
         .orderBy("publishedAt", "desc")
         .limit(limit)
         .withConverter<Spark>(createGenericConverter())

      const groupFeedSnap = await query.get()

      return groupFeedSnap.docs.map((doc) =>
         SparkPresenter.serialize(doc.data())
      )
   }

   async getUserFeedMetrics(userId: string): Promise<UserSparksFeedMetrics> {
      const userFeedSnap = await this.firestore
         .collection("sparksFeedMetrics")
         .withConverter<UserSparksFeedMetrics>(createGenericConverter())
         .doc(userId)
         .get()

      return userFeedSnap.data()
   }

   async replenishUserFeed(userId: string): Promise<void> {
      const userSparkFeedMetrics = await this.getUserFeedMetrics(userId)

      return this.feedReplenisher.replenishUserFeed(
         userId,
         userSparkFeedMetrics
      )
   }

   async markSparkAsSeenByUser(userId: string, sparkId: string): Promise<void> {
      // check if the spark has already been seen by the user
      if (await this.hasUserSeenSpark(userId, sparkId)) {
         return
      }

      const currentYear = DateTime.now().year // 2023
      const seenSparkDocRef = this.firestore
         .doc(`userData/${userId}/seenSparks/${currentYear}`)
         .withConverter<SeenSparks>(createGenericConverter())

      const seenSparkDoc = await seenSparkDocRef.get()
      let currentSeenSparks: SeenSparks

      if (seenSparkDoc.exists) {
         currentSeenSparks = seenSparkDoc.data()
      } else {
         currentSeenSparks = createSeenSparksDocument(userId, currentYear)
      }

      // If the spark is not already marked as seen for this user
      currentSeenSparks.sparks[sparkId] = Timestamp.now()

      await seenSparkDocRef.set(currentSeenSparks, { merge: true })
   }

   async hasUserSeenSpark(userId: string, sparkId: string): Promise<boolean> {
      const seenSparksDocsSnap = await this.firestore
         .collection(`userData/${userId}/seenSparks`)
         .where(`sparks.${sparkId}`, "!=", null)
         .limit(1)
         .get()

      return !seenSparksDocsSnap.empty
   }

   async removeSparkFromUserFeed(
      userId: string,
      sparkId: string
   ): Promise<void> {
      const sparkRef = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("sparksFeed")
         .doc(sparkId)

      await sparkRef.delete()
   }

   async removeSparkFromAllUserFeeds(sparkId: string): Promise<void> {
      const sparksFromFeedToBeDeletedSnap = await this.firestore
         .collectionGroup("sparksFeed")
         .where("id", "==", sparkId)
         .get()
      const bulkWriter = this.firestore.bulkWriter()

      sparksFromFeedToBeDeletedSnap.docs.forEach((sparkDoc) => {
         void bulkWriter.delete(sparkDoc.ref)
      })

      await bulkWriter.close()
   }

   async addSparkToAllUserFeeds(spark: Spark): Promise<void> {
      if (!spark.group.publicSparks || !spark.published) {
         // If the spark is not public, don't add it to the feed
         return
      }
      const bulkWriter = this.firestore.bulkWriter()

      const allUsersWithAFeedSnap = await this.firestore
         .collection("sparksFeedMetrics")
         .withConverter<UserSparksFeedMetrics>(createGenericConverter())
         .get()

      allUsersWithAFeedSnap.docs.forEach((metricsDoc) => {
         const userId = metricsDoc.data().userId

         const userSparkFeedRef = this.firestore
            .collection("userData")
            .doc(userId)
            .collection("sparksFeed")
            .doc(spark.id)

         addAddedToFeedAt(spark)

         void bulkWriter.set(userSparkFeedRef, spark, { merge: true })
      })

      await bulkWriter.close()
   }

   async updateSparkInAllUserFeeds(spark: Spark): Promise<void> {
      const sparkNoLongerPublic = !spark.group.publicSparks || !spark.published

      const bulkWriter = this.firestore.bulkWriter()

      const allUserMatchingSparksSnap = await this.firestore
         .collectionGroup("sparksFeed")
         .withConverter<Spark>(createGenericConverter())
         .where("id", "==", spark.id)
         .get()

      if (sparkNoLongerPublic) {
         // If the spark is no longer public, delete it from all user feeds
         allUserMatchingSparksSnap.docs.forEach((sparkDoc) => {
            void bulkWriter.delete(sparkDoc.ref)
         })
      } else {
         // If the spark is still public, update it in all user feeds
         allUserMatchingSparksSnap.docs.forEach((sparkDoc) => {
            // @ts-ignore
            void bulkWriter.update(sparkDoc.ref, spark)
         })
      }

      await bulkWriter.close()
   }

   async incrementFeedCount(
      userId: string,
      type: "increment" | "decrement"
   ): Promise<void> {
      const ref = this.firestore.collection("sparksFeedMetrics").doc(userId)

      await ref.update({
         numberOfSparks: FieldValue.increment(type === "increment" ? 1 : -1),
      })
   }

   async getSparksByGroupId(groupId: string): Promise<Spark[]> {
      const snapshot = await this.firestore
         .collection("sparks")
         .withConverter<Spark>(createGenericConverter())
         .where("group.id", "==", groupId)
         .orderBy("createdAt", "desc")
         .get()

      return snapshot.docs.map((doc) => doc.data())
   }

   async getPublishedSparksByGroupId(groupId: string): Promise<Spark[]> {
      const snapshot = await this.firestore
         .collection("sparks")
         .withConverter<Spark>(createGenericConverter())
         .where("group.id", "==", groupId)
         .where("group.publicSparks", "==", true)
         .where("published", "==", true)
         .orderBy("createdAt", "desc")
         .get()

      return snapshot.docs.map((doc) => doc.data())
   }

   async groupHasPublishedSparks(groupId: string, limit = 1): Promise<boolean> {
      const snapshot = await this.firestore
         .collection("sparks")
         .withConverter<Spark>(createGenericConverter())
         .where("group.id", "==", groupId)
         .where("group.publicSparks", "==", true)
         .where("published", "==", true)
         .orderBy("createdAt", "desc")
         .limit(limit)
         .get()

      return !snapshot.empty
   }

   async getAllUserSparksFeedMetrics(): Promise<UserSparksFeedMetrics[]> {
      const snapshot = await this.firestore
         .collection("sparksFeedMetrics")
         .withConverter<UserSparksFeedMetrics>(createGenericConverter())
         .get()

      return snapshot.docs.map((doc) => doc.data())
   }

   async removeAllSparkNotificationsByGroup(groupId: string): Promise<void> {
      const bulkWriter = this.firestore.bulkWriter()

      const snapShot = await this.firestore
         .collectionGroup("sparksNotifications")
         .where("groupId", "==", groupId)
         .get()

      snapShot.docs.forEach((doc) => {
         void bulkWriter.delete(doc.ref)
      })

      return void bulkWriter.close()
   }

   async removeUserSparkNotification(
      userId: string,
      groupId: string
   ): Promise<void> {
      const sparkRef = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("sparksNotifications")
         .doc(groupId)

      return void sparkRef.delete()
   }

   async getUserSparkNotifications(
      userId: string
   ): Promise<UserSparksNotification[]> {
      const snapshot = await this.firestore
         .collection("userData")
         .doc(userId)
         .collection("sparksNotifications")
         .withConverter<UserSparksNotification>(createGenericConverter())
         .get()

      return snapshot.docs.map((doc) => doc.data())
   }

   async trackSparkEvents(events: SparkEvent[]): Promise<void> {
      return this.sparkEventHandler.insertData(events)
   }

   async trackSparkSecondsWatched(events: SparkSecondWatched[]): Promise<void> {
      return this.sparkSecondsWatchedHandler.insertData(events)
   }

   async addSparkToSparkStatsDocument(
      sparkId: string,
      snapshot: DocumentSnapshot
   ): Promise<void> {
      const spark = await this.get(sparkId)

      const sparkStatsRef = snapshot.ref

      const sparkStats: Pick<SparkStats, "spark"> = {
         spark,
      }

      return void sparkStatsRef.update(sparkStats)
   }

   async syncSparkToSparkStatsDocument(spark: Spark): Promise<void> {
      const sparkStatsRef = this.firestore
         .collection("sparkStats")
         .doc(spark.id)

      const sparkStatsSnap = await sparkStatsRef.get()

      if (sparkStatsSnap.exists) {
         const sparkStats: Pick<SparkStats, "spark"> = {
            spark,
         }

         return void sparkStatsRef.update(sparkStats)
      } else {
         // Create a new document in the sparkStats collection
         const sparkStats: SparkStats = {
            spark,
            id: spark.id,
            impressions: 0,
            likes: 0,
            numberOfCareerPageClicks: 0,
            numberOfCompanyPageClicks: 0,
            plays: 0,
            shareCTA: 0,
            numberTimesCompletelyWatched: 0,
            totalWatchedMinutes: 0,
            uniquePlays: 0,
            deleted: false,
            deletedAt: null,
         }

         return void sparkStatsRef.set(sparkStats)
      }
   }

   async createSparkUserNotification(spark: Spark): Promise<void> {
      const { group } = spark

      functions.logger.log(
         `start creating notifications for the Spark ${spark.id}`
      )

      if (!group.publicSparks || !spark.published) {
         // if the group or the spark is not yet public, don't create notification
         functions.logger.log(
            `Group ${group.universityName} or Spark ${spark.id} are not public, so no notification will be created`
         )
         return
      }

      const bulkWriter = this.firestore.bulkWriter()

      const followers = await userRepo.getGroupFollowers(group.id)

      functions.logger.log(
         `Will create notification for ${followers.length} users`
      )

      followers.forEach((follower) => {
         const ref = this.firestore
            .collection("userData")
            .doc(follower.userId)
            .collection("userNotifications")
            .doc()

         const newNotification: UserNotification = {
            documentType: "userNotification",
            actionUrl: `/sparks/${spark.id}?interactionSource=${SparkInteractionSources.New_Spark_Notification}`,
            companyId: group.id,
            sparkId: spark.id,
            imageFormat: "circular",
            imageUrl: group.logoUrl,
            message: `<strong>${group.universityName}</strong> has recently published a new Spark. Watch it now!`,
            createdAt: Timestamp.now(),
            id: ref.id,
         }

         void bulkWriter.set(ref, newNotification, { merge: true })
      })

      return void bulkWriter.close()
   }

   async getUserSparkInteraction<T extends Identifiable>(
      userId: string,
      subCollectionName: string
   ): Promise<T[]> {
      const userSeenSparksSnapshot = await this.firestore
         .collection("userData")
         .doc(userId)
         .collection(subCollectionName)
         .withConverter<T>(createGenericConverter())
         .get()

      return userSeenSparksSnapshot.docs.map((doc) => doc.data())
   }

   async getSparksByIds(sparkIds: string[]): Promise<Spark[]> {
      const uniqueSparkIds = Array.from(new Set(sparkIds))
      const sparkRefs = uniqueSparkIds.map((sparkId) =>
         this.firestore
            .collection("sparks")
            .withConverter<Spark>(createGenericConverter())
            .doc(sparkId)
      )

      const sparkSnapshots = await Promise.all(
         sparkRefs.map((ref) => ref.get())
      )

      return sparkSnapshots
         .filter((snap) => snap.exists)
         .map((snapshot) => ({
            ...snapshot.data(),
            id: snapshot.id,
         }))
   }

   async syncCustomJobBusinessFunctionTagsToSparks(
      afterJob: CustomJob,
      beforeJob: CustomJob,
      changeType: ReturnType<typeof getChangeTypes>
   ): Promise<void> {
      functions.logger.log(
         `Sync tags with sparks from customJob: ${afterJob.id}`
      )

      // When creating data manually on firefoo an empty object is created first
      // this prevents doing any processing if no id is present, the remaining checks
      // for linked content is null safe and will also result in an early return for empty objects
      if (!afterJob?.id) return

      const updatePromises = []
      const updatedSparks = await syncCustomJobLinkedContentTags(
         afterJob,
         beforeJob,
         changeType,
         (job) => job?.sparks ?? [],
         (sparkIds) => this.getSparksByIds(sparkIds),
         (sparkIds) =>
            customJobRepo.getCustomJobsByLinkedContentIds("sparks", sparkIds)
      )

      updatedSparks
         .map((spark) => {
            const ref = this.firestore
               .collection("sparks")
               .withConverter(createGenericConverter<Spark>())
               .doc(spark.id)

            functions.logger.log(
               `live stream ${spark.id} tags after sync: ${spark.linkedCustomJobsTagIds}`
            )

            return ref.update({
               linkedCustomJobsTagIds: spark.linkedCustomJobsTagIds,
            })
         })
         .forEach((updatePromise) => updatePromises.push(updatePromise))

      const results = await Promise.allSettled(updatePromises)

      const errors = results.filter((res) => res.status == "rejected")

      if (errors.length) {
         logAndThrow("Error synching tags with sparks", {
            sparkIds: afterJob.sparks,
            customJobId: afterJob.id,
            errors: errors,
         })
      }

      functions.logger.log(`Updated sparks linked to customJob ${afterJob.id}`)
   }

   async syncGroupSparksHasJobsFlag(
      afterJob: CustomJob,
      beforeJob: CustomJob
   ): Promise<void> {
      // Compare the sparks in afterJob and beforeJob to determine if they are identical
      const areSparksEqual = beforeJob
         ? getArrayDifference(afterJob.sparks, beforeJob.sparks).length === 0 &&
           getArrayDifference(beforeJob.sparks, afterJob.sparks).length === 0
         : true

      if (areSparksEqual) {
         // If the sparks are the same, exit the function early
         return
      }

      // Get the sparks that were added to afterJob
      const addedSparks = beforeJob
         ? (getArrayDifference(beforeJob.sparks, afterJob.sparks) as string[])
         : afterJob.sparks

      // Get the live streams that were removed from beforeJob
      const removedSparks = beforeJob
         ? (getArrayDifference(afterJob.sparks, beforeJob.sparks) as string[])
         : []

      // Get all customJobs from the group id
      const customJobs = await customJobRepo.getCustomJobsByGroupId(
         afterJob.groupId
      )

      // Remove the current job from the array
      const filteredCustomJobs = customJobs.filter(
         (job) => job.id !== afterJob.id
      )

      // Filter the sparks that have been removed from the jobs
      const sparksWithoutJobs = removedSparks.filter((sparkId) => {
         return filteredCustomJobs.every((job) => !job.sparks.includes(sparkId))
      })

      // Filter the sparks that have been added to the jobs
      const sparksWithNewJobAssignment = addedSparks.filter((sparkId) => {
         return !filteredCustomJobs.some((job) => job.sparks.includes(sparkId))
      })

      const batch = this.firestore.batch()

      const allSparks = await this.getSparksByIds([
         ...sparksWithoutJobs,
         ...sparksWithNewJobAssignment,
      ])

      const allSparksMap = new Map(allSparks.map((spark) => [spark.id, true]))
      // Update the sparks without jobs to have hasJob: false
      sparksWithoutJobs
         .filter((sparkId) => allSparksMap.has(sparkId))
         .forEach((sparkId) => {
            functions.logger.log(
               `Update spark ${sparkId} to be with hasJobs flag as false`
            )
            batch.update(this.firestore.collection("sparks").doc(sparkId), {
               hasJobs: false,
            })
         })

      // Update the sparks with new job assignment to have hasJob: true
      sparksWithNewJobAssignment
         .filter((sparkId) => allSparksMap.has(sparkId))
         .forEach((sparkId) => {
            functions.logger.log(
               `Update spark ${sparkId} to be with hasJobs flag as true`
            )

            batch.update(this.firestore.collection("sparks").doc(sparkId), {
               hasJobs: true,
            })
         })

      await batch.commit()
   }
}

const deleteOptions = {
   ignoreNotFound: true,
} as const
