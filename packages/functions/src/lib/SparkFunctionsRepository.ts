import BaseFirebaseRepository from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Create } from "@careerfairy/shared-lib/commonTypes"
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
import { DocumentSnapshot } from "firebase-admin/firestore"
import { Change } from "firebase-functions"
import { DateTime } from "luxon"
import { FunctionsLogger } from "src/util"
import { FieldPath, Firestore, Storage, Timestamp } from "../api/firestoreAdmin"
import { createGenericConverter } from "../util/firestore-admin"

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
   replenishUserFeed(
      userId: string,
      feed?: UserSparksFeedMetrics
   ): Promise<void>

   /**
    * Get all the sparks that a user has seen over the years
    * - It queries the /userData/{userId}/seenSparks collection
    * - each document has all the seen sparks by the user for a particular year
    * @param userId
    */
   getUserSeenSparks(userId: string): Promise<SeenSparks[]>

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

   getSparksByGroupId(groupId: string): Promise<Spark[]>
}

export class SparkFunctionsRepository
   extends BaseFirebaseRepository
   implements ISparkFunctionsRepository
{
   constructor(
      readonly firestore: Firestore,
      readonly storage: Storage,
      readonly logger: FunctionsLogger
   ) {
      super()
   }

   private readonly TARGET_SPARK_COUNT = 100 // The number of sparks a user's feed should have

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
      const doc: Create<Spark> = {
         question: data.question,
         video: data.video,
         category: getCategoryById(data.categoryId),
         createdAt: Timestamp.now(),
         publishedAt: data.published ? Timestamp.now() : null,
         updatedAt: null,
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
      }

      return void this.firestore.collection("sparks").add(doc)
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
      > = {
         question: data.question,
         category: getCategoryById(data.categoryId),
         updatedAt: Timestamp.now(),
         published: data.published,
         creator: pickPublicDataFromCreator(creator),
         ...(data.published && {
            publishedAt: Timestamp.now(),
         }),
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
      // TODO: Should be replaced with recommendation engine dependency injection in the future
      // This is a simple shuffle using the Fisher-Yates algorithm
      for (let i = sparks.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1))
         ;[sparks[i], sparks[j]] = [sparks[j], sparks[i]]
      }

      // Store in UserFeed
      const userFeed: UserSparksFeedMetrics = {
         id: userId,
         userId,
         lastUpdated: Timestamp.now(),
         numberOfSparks: sparks.length,
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
         .collection("sparksFeed")
         .withConverter(createGenericConverter<UserSparksFeedMetrics>())
         .doc(userId)
         .get()

      return userFeedSnap.data()
   }

   async getUserSeenSparks(userId: string): Promise<SeenSparks[]> {
      const seenSparksSnap = await this.firestore
         .collection(`userData/${userId}/seenSparks`)
         .withConverter(createGenericConverter<SeenSparks>())
         .get()

      return seenSparksSnap.docs.map((doc) => doc.data())
   }

   async replenishUserFeed(
      userId: string,
      feed?: UserSparksFeedMetrics
   ): Promise<void> {
      const userSparkFeedMetrics = feed
         ? feed
         : await this.getUserFeedMetrics(userId)
      const currentSparkCount = userSparkFeedMetrics.numberOfSparks

      if (currentSparkCount < this.TARGET_SPARK_COUNT) {
         const neededSparks = this.TARGET_SPARK_COUNT - currentSparkCount

         const allSeenSparksArr = await this.getUserSeenSparks(userId)
         const seenSparkIds = allSeenSparksArr.flatMap((sparks) =>
            Object.keys(sparks.sparks)
         )

         const sparksSnap = await this.firestore
            .collection("sparks")
            .withConverter(createGenericConverter<Spark>())
            .orderBy("publishedAt", "desc")
            .limit(seenSparkIds.length + neededSparks)
            .get()

         const newSparks: Spark[] = []

         // Only add the spark if the user hasn't seen it
         sparksSnap.docs.forEach((doc) => {
            if (!seenSparkIds.includes(doc.id)) {
               newSparks.push(doc.data())
            }
         })

         // store the new sparks in the user's feed
         const batch = this.firestore.batch()
         newSparks.forEach((spark) => {
            const sparkRef = this.firestore
               .collection("userData")
               .doc(userId)
               .collection("sparksFeed")
               .doc(spark.id)

            batch.set(sparkRef, spark, { merge: true })
         })

         return void batch.commit()
      }
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
      if (!currentSeenSparks.sparks[sparkId]) {
         currentSeenSparks.sparks[sparkId] = Timestamp.now()

         await seenSparkDocRef.set(currentSeenSparks, { merge: true })
      }
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

      allUsersWithAFeedSnap.docs.forEach((sparkDoc) => {
         const userId = sparkDoc.data().userId

         const userSparkFeedRef = this.firestore
            .collection("userData")
            .doc(userId)
            .collection("sparksFeed")
            .doc(spark.id)

         bulkWriter.set(userSparkFeedRef, spark, { merge: true })
      })

      await bulkWriter.close()
   }

   async updateSparkInAllUserFeeds(spark: Spark): Promise<void> {
      const bulkWriter = this.firestore.bulkWriter()

      const allUserMatchingSparksSnap = await this.firestore
         .collectionGroup("sparksFeed")
         .withConverter(createGenericConverter<Spark>())
         .where(FieldPath.documentId(), "==", spark.id)
         .get()

      allUserMatchingSparksSnap.docs.forEach((sparkDoc) => {
         bulkWriter.update(sparkDoc.ref, spark)
      })

      await bulkWriter.close()
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
}

const deleteOptions = {
   ignoreNotFound: true,
} as const
