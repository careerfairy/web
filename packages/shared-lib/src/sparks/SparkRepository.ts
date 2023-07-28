import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../BaseFirebaseRepository"
import {
   AddSparkSparkData,
   DeletedSpark,
   Spark,
   UpdateSparkData,
   getCategoryById,
} from "./sparks"
import { Create } from "../commonTypes"
import { Group, pickPublicDataFromGroup } from "../groups"
import { Creator, pickPublicDataFromCreator } from "../groups/creators"

export interface ISparkRepository {
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
}

export class SparkRepository
   extends BaseFirebaseRepository
   implements ISparkRepository
{
   constructor(
      readonly firestore: firebase.firestore.Firestore,
      readonly fieldValue: typeof firebase.firestore.FieldValue,
      readonly timestamp: typeof firebase.firestore.Timestamp
   ) {
      super()
   }

   async get(id: string): Promise<Spark | null> {
      const doc = await this.firestore
         .collection("sparks")
         .withConverter(createCompatGenericConverter<Spark>())
         .doc(id)
         .get()

      return doc.exists ? doc.data() : null
   }

   async delete(id: string): Promise<void> {
      const sparkRef = this.firestore
         .collection("sparks")
         .withConverter(createCompatGenericConverter<Spark>())
         .doc(id)

      const sparkDeletedRef = this.firestore.collection("deletedSparks").doc(id)

      // Get the document
      const sparkSnap = await sparkRef.get()

      if (!sparkSnap.exists) {
         throw new Error("Spark does not exist")
      }

      const batch = this.firestore.batch()

      // Delete the document
      batch.delete(sparkRef)

      // Create a new document in the deleted collection
      const deletedSpark: DeletedSpark = {
         ...sparkSnap.data()!,
         deletedAt: this.timestamp.now(),
      }
      batch.set(sparkDeletedRef, deletedSpark)

      return batch.commit()
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
         createdAt: this.fieldValue.serverTimestamp() as any,
         publishedAt: data.published
            ? (this.fieldValue.serverTimestamp() as any)
            : null,
         updatedAt: null,
         published: data.published,
         likes: 0,
         impressions: 0,
         plays: 0,
         totalWatchedMinutes: 0,
         uniquePlays: 0,
         shareCTA: 0,
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
         updatedAt: this.fieldValue.serverTimestamp() as any,
         published: data.published,
         creator: pickPublicDataFromCreator(creator),
         ...(data.published && {
            publishedAt: this.fieldValue.serverTimestamp() as any,
         }),
      }

      return void this.firestore.collection("sparks").doc(data.id).update(doc)
   }
}
