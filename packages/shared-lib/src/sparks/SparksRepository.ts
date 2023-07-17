import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../BaseFirebaseRepository"
import { AddSparkSparkData, Spark } from "./sparks"
import { Create } from "../commonTypes"
import { Group, pickPublicDataFromGroup } from "../groups"

export interface ISparksRepository {
   /**
    *  Get a spark
    * @param id  The id of the spark
    */
   get(id: string): Promise<Spark | null>

   /**
    *  Delete a spark
    * @param id  The id of the spark
    */
   delete(id: string): Promise<void>

   /**
    *  Create a spark
    * @param spark  The spark to create
    */
   create(spark: AddSparkSparkData, group: Group): Promise<void>
}

export class SparksRepository
   extends BaseFirebaseRepository
   implements ISparksRepository
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
      return this.firestore.collection("sparks").doc(id).delete()
   }

   async create(spark: AddSparkSparkData, group: Group): Promise<void> {
      const doc: Create<Spark> = {
         ...spark,
         createdAt: this.fieldValue.serverTimestamp() as any,
         publishedAt: this.fieldValue.serverTimestamp() as any,
         updatedAt: null,
         state: "published",
         likes: 0,
         impressions: 0,
         plays: 0,
         totalWatchedMinutes: 0,
         uniquePlays: 0,
         shareCTA: 0,
         group: pickPublicDataFromGroup(group),
      }

      return void this.firestore.collection("sparks").add(doc)
   }
}
