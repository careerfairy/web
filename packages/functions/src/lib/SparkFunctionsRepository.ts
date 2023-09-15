import BaseFirebaseRepository from "@careerfairy/shared-lib/BaseFirebaseRepository"
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
   UpdateSparkData,
   UserSparksFeedMetrics,
   createSeenSparksDocument,
   getCategoryById,
} from "@careerfairy/shared-lib/sparks/sparks"
import { shuffle } from "@careerfairy/shared-lib/utils"
import { DocumentSnapshot } from "firebase-admin/firestore"
import { Change } from "firebase-functions"
import { DateTime } from "luxon"
import { FunctionsLogger } from "src/util"
import {
   FieldPath,
   FieldValue,
   Firestore,
   Storage,
   Timestamp,
} from "../api/firestoreAdmin"
import { createGenericConverter } from "../util/firestore-admin"
import { addAddedToFeedAt } from "../util/sparks"
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
   getPublicSparksFeed(limit?: number): Promise<SerializedSpark[]>

   /**
    * Get the group's feed of Sparks
    * @param groupId ${groupId} The id of the group
    * @param limit ${limit} The number of sparks to fetch (default: 10)
    */
   getGroupSparksFeed(
      groupId: string,
      limit?: number
   ): Promise<SerializedSpark[]>

   /**
    * Method to replenish a user's feed, when the number of sparks in the feed is less than x
    * @param userId The id of the user
    * @param feed The user's feed if provided, we won't fetch it again
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
    * Adds a spark to all user feeds
    * @param spark The spark to add.
    * @returns void
    */
   addSparkToAllUserFeeds(spark: Spark): Promise<void>

   /**
    * Updates a spark in all user feeds
    * @param spark The spark to update.
    * @returns void
    */
   updateSparkInAllUserFeeds(spark: Spark): Promise<void>

   /**
    * Increment/Decrement the sparks feed count for a user
    * @param userId The ID of the user.
    * @returns void
    */
   incrementFeedCount(
      userId: string,
      type: "increment" | "decrement"
   ): Promise<void>

   getSparksByGroupId(groupId: string): Promise<Spark[]>

   /**
    * Get all user sparks feed metrics
    *
    */
   getAllUserSparksFeedMetrics(): Promise<UserSparksFeedMetrics[]>

   /**
    * Remove all spark notifications related to a specific group
    *
    */
   removeSparkNotification(groupId: string): Promise<void>

   /**
    * Remove specific spark notifications from a single user
    *
    */
   removeUserSparkNotification(userId: string, groupId: string): Promise<void>
}

export class SparkFunctionsRepository
   extends BaseFirebaseRepository
   implements ISparkFunctionsRepository
{
   constructor(
      readonly firestore: Firestore,
      readonly storage: Storage,
      readonly logger: FunctionsLogger,
      readonly feedReplisher: SparksFeedReplenisher
   ) {
      super()
   }

   private readonly TARGET_SPARK_COUNT = 20 // The number of sparks a user's feed should have

   async get(id: string): Promise<Spark | null> {
      const doc = await this.firestore
         .collection("sparks")
         .withConverter(createGenericConverter<Spark>())
         .doc(id)
         .get()

      return doc.exists ? doc.data() : null
   }

   async delete(id: string): Promise<void> {
      const sparkRef = this.firestore.collection("sparks").doc(id)
      const sparkDeletedRef = this.firestore.collection("deletedSparks").doc(id)

      // Get the document
      const sparkSnap = await sparkRef.get()
      const sparkData = sparkSnap.data() as Spark

      if (!sparkSnap.exists) {
         throw new Error("Spark does not exist")
      }

      const batch = this.firestore.batch()

      // Delete the document
      batch.delete(sparkRef)

      // Create a new document in the deleted collection
      const deletedSpark: DeletedSpark = {
         ...sparkData,
         deletedAt: Timestamp.now(),
      }
      batch.set(sparkDeletedRef, deletedSpark)

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
         createdAt: Timestamp.now(),
         publishedAt: data.published ? Timestamp.now() : null,
         updatedAt: null,
         addedToFeedAt: null,
         published: data.published,
         likes: 0,
         impressions: 0,
         plays: 0,
         totalWatchedMinutes: 0,
         uniquePlays: 0,
         shareCTA: 0,
         numberOfCareerPageClicks: 0,
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
         | "creator"
         | "question"
         | "published"
         | "updatedAt"
         | "publishedAt"
         | "id"
      > = {
         question: data.question,
         category: getCategoryById(data.categoryId),
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

      const sparksSnap = await this.firestore
         .collection("sparks")
         .withConverter(createGenericConverter<Spark>())
         .orderBy("publishedAt", "desc")
         .limit(this.TARGET_SPARK_COUNT)
         .get()

      const sparks = sparksSnap.docs.map((doc) => doc.data())

      // Randomize sparkIds array
      shuffle(sparks)

      // Store in UserFeed
      const userFeed: Omit<UserSparksFeedMetrics, "numberOfSparks"> = {
         id: userId,
         userId,
         lastReplenished: Timestamp.now(),
         replenishStatus: "finished",
      }

      const feedRef = this.firestore.collection("sparksFeedMetrics").doc(userId)

      await batch.set(feedRef, userFeed, { merge: true })

      // Store in UserFeed
      sparks.forEach((spark) => {
         const sparkRef = this.firestore
            .collection("userData")
            .doc(userId)
            .collection("sparksFeed")
            .doc(spark.id)

         addAddedToFeedAt(spark)

         batch.set(sparkRef, spark, { merge: true })
      })

      await batch.commit()

      return sparks.map(SparkPresenter.serialize)
   }

   async getUserSparksFeed(
      userId: string,
      limit = 10
   ): Promise<SerializedSpark[]> {
      const userFeedRef = this.firestore
         .collection("userData")
         .doc(userId)
         .collection("sparksFeed")
         .orderBy("publishedAt", "desc")
         .limit(limit)
         .withConverter(createGenericConverter<Spark>())

      const userFeedSnap = await userFeedRef.get()

      // If the user doesn't have a feed, we will generate one
      if (userFeedSnap.empty) {
         return this.generateSparksFeed(userId)
      }

      return userFeedSnap.docs.map((doc) =>
         SparkPresenter.serialize(doc.data())
      )
   }

   async getPublicSparksFeed(limit = 10): Promise<SerializedSpark[]> {
      const publicFeedRef = this.firestore
         .collection("sparks")
         .orderBy("publishedAt", "desc")
         .limit(limit)
         .withConverter(createGenericConverter<Spark>())

      const publicFeedSnap = await publicFeedRef.get()

      return publicFeedSnap.docs.map((doc) =>
         SparkPresenter.serialize(doc.data())
      )
   }

   async getGroupSparksFeed(
      groupId: string,
      limit = 10
   ): Promise<SerializedSpark[]> {
      const groupFeedRef = this.firestore
         .collection("sparks")
         .where("group.id", "==", groupId)
         .orderBy("publishedAt", "desc")
         .limit(limit)
         .withConverter(createGenericConverter<Spark>())

      const groupFeedSnap = await groupFeedRef.get()

      return groupFeedSnap.docs.map((doc) =>
         SparkPresenter.serialize(doc.data())
      )
   }

   async getUserFeedMetrics(userId: string): Promise<UserSparksFeedMetrics> {
      const userFeedSnap = await this.firestore
         .collection("sparksFeedMetrics")
         .withConverter(createGenericConverter<UserSparksFeedMetrics>())
         .doc(userId)
         .get()

      return userFeedSnap.data()
   }

   async replenishUserFeed(userId: string): Promise<void> {
      const userSparkFeedMetrics = await this.getUserFeedMetrics(userId)

      // TODO: Should be replaced with recommendation engine dependency injection in the future
      return this.feedReplisher.replenishUserFeed(userId, userSparkFeedMetrics)
   }

   async markSparkAsSeenByUser(userId: string, sparkId: string): Promise<void> {
      // check if the spark has already been seen by the user
      if (await this.hasUserSeenSpark(userId, sparkId)) {
         return
      }

      const currentYear = DateTime.now().year // 2023
      const seenSparkDocRef = this.firestore
         .doc(`userData/${userId}/seenSparks/${currentYear}`)
         .withConverter(createGenericConverter<SeenSparks>())

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
         .where(FieldPath.documentId(), "==", sparkId)
         .get()
      const bulkWriter = this.firestore.bulkWriter()

      sparksFromFeedToBeDeletedSnap.docs.forEach((sparkDoc) => {
         bulkWriter.delete(sparkDoc.ref)
      })

      await bulkWriter.close()
   }

   async addSparkToAllUserFeeds(spark: Spark): Promise<void> {
      const bulkWriter = this.firestore.bulkWriter()

      const allUsersWithAFeedSnap = await this.firestore
         .collection("sparksFeedMetrics")
         .withConverter(createGenericConverter<UserSparksFeedMetrics>())
         .get()

      allUsersWithAFeedSnap.docs.forEach((metricsDoc) => {
         const userId = metricsDoc.data().userId

         const userSparkFeedRef = this.firestore
            .collection("userData")
            .doc(userId)
            .collection("sparksFeed")
            .doc(spark.id)

         addAddedToFeedAt(spark)

         bulkWriter.set(userSparkFeedRef, spark, { merge: true })
      })

      await bulkWriter.close()
   }

   async updateSparkInAllUserFeeds(spark: Spark): Promise<void> {
      const bulkWriter = this.firestore.bulkWriter()

      const allUserMatchingSparksSnap = await this.firestore
         .collectionGroup("sparksFeed")
         .withConverter(createGenericConverter<Spark>())
         .where("id", "==", spark.id)
         .get()

      allUserMatchingSparksSnap.docs.forEach((sparkDoc) => {
         bulkWriter.update(sparkDoc.ref, spark)
      })

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
         .withConverter(createGenericConverter<Spark>())
         .where("group.id", "==", groupId)
         .orderBy("createdAt", "desc")
         .get()

      return snapshot.docs.map((doc) => doc.data())
   }

   async getAllUserSparksFeedMetrics(): Promise<UserSparksFeedMetrics[]> {
      const snapshot = await this.firestore
         .collection("sparksFeedMetrics")
         .withConverter(createGenericConverter<UserSparksFeedMetrics>())
         .get()

      return snapshot.docs.map((doc) => doc.data())
   }

   async removeSparkNotification(groupId: string): Promise<void> {
      const bulkWriter = this.firestore.bulkWriter()

      const snapShot = await this.firestore
         .collectionGroup("sparksNotifications")
         .where("groupId", "==", groupId)
         .get()

      snapShot.docs.forEach((doc) => {
         bulkWriter.delete(doc.ref)
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
}

const deleteOptions = {
   ignoreNotFound: true,
} as const
