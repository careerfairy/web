import BaseFirebaseRepository from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Create } from "@careerfairy/shared-lib/commonTypes"
import { Group, pickPublicDataFromGroup } from "@careerfairy/shared-lib/groups"
import {
   Creator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import {
   AddSparkSparkData,
   DeletedSpark,
   Spark,
   UpdateSparkData,
   getCategoryById,
} from "@careerfairy/shared-lib/sparks/sparks"
import { createGenericConverter } from "../util/firestore-admin"
import { Timestamp, Storage, Firestore } from "../api/firestoreAdmin"
import { FunctionsLogger } from "src/util"
import { Change } from "firebase-functions"
import { DocumentSnapshot } from "firebase-admin/firestore"

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

   async getSparksByGroupId(groupId: string): Promise<Spark[]> {
      const snapshot = await this.firestore
         .collection("sparks")
         .where("group.id", "==", groupId)
         .orderBy("createdAt", "desc")
         .get()

      if (!snapshot.empty) {
         return snapshot.docs?.map(
            (doc) =>
               ({
                  id: doc.id,
                  ...doc.data(),
               } as Spark)
         )
      }

      return []
   }
}

const deleteOptions = {
   ignoreNotFound: true,
} as const
