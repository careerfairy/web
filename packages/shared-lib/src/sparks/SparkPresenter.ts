import {
   DocumentData,
   FirestoreDataConverter,
   Timestamp,
} from "firebase/firestore"
import { fromSerializedDate } from "../BaseModel"
import { Spark, SparkCategory, SparkVideo } from "./sparks"

interface SparkPresenterInterface
   extends Omit<Spark, "createdAt" | "updatedAt" | "publishedAt"> {
   createdAt: Date
   updatedAt: Date
   publishedAt: Date
}

export interface SerializedSpark
   extends Omit<Spark, "createdAt" | "updatedAt" | "publishedAt"> {
   createdAt: number
   updatedAt: number
   publishedAt: number
}

/**
 * `SparkPresenter` bridges Firestore's `Spark` document and client-side needs.
 * It handles data conversions, offers utility methods for specific Spark operations,
 * and ensures data consistency when interacting with Firestore.
 *
 * Features:
 * - Converts Firestore Timestamps to JavaScript Dates and vice-versa.
 * - Provides utility methods like formatting video URLs and extracting creator display names.
 *
 * @example
 * const sparkPresenter = SparkPresenter.createFromFirebaseObject(firestoreObject);
 * const displayName = sparkPresenter.getCreatorDisplayName();
 *
 * @class
 */
export class SparkPresenter implements SparkPresenterInterface {
   id: string
   group: Spark["group"]
   creator: Spark["creator"]
   createdAt: Date
   updatedAt: Date
   publishedAt: Date
   published: boolean
   category: SparkCategory
   question: string
   video: SparkVideo
   impressions: number
   uniquePlays: number
   plays: number
   totalWatchedMinutes: number
   likes: number
   shareCTA: number
   numberOfCareerPageClicks: number

   // Additional properties can be added here as the Spark structure evolves

   // The SparkPresenter constructor
   constructor(data: Partial<SparkPresenter>) {
      Object.assign(this, data)
   }

   /**
    * Retrieves the display name for the spark's creator.
    * @returns {string} Creator's display name.
    */
   getCreatorDisplayName(): string {
      return `${this.creator.firstName} ${this.creator.lastName}`
   }

   /**
    * Convert from plain objects (json/object) into SparkPresenter class instance
    */
   static deserialize(plainObject: SerializedSpark): SparkPresenter {
      return new SparkPresenter({
         ...plainObject,
         createdAt: fromSerializedDate(plainObject.createdAt),
         updatedAt: fromSerializedDate(plainObject.updatedAt),
         publishedAt: fromSerializedDate(plainObject.publishedAt),
      })
   }

   /**
    * Deserialize from Firebase's Timestamp to SparkPresenter class instance
    */
   static createFromFirebaseObject(
      firebaseObject: Spark | DocumentData
   ): SparkPresenter {
      return new SparkPresenter({
         ...firebaseObject,
         createdAt: firebaseObject.createdAt
            ? firebaseObject.createdAt.toDate()
            : new Date(),
         updatedAt: firebaseObject.updatedAt
            ? firebaseObject.updatedAt.toDate()
            : null,
         publishedAt: firebaseObject.publishedAt
            ? firebaseObject.publishedAt.toDate()
            : null,
      })
   }

   /**
    * Serialize from SparkPresenter or Spark to allow passing it from the server to the client
    * @param sparkPresenterOrSpark
    * @returns  SerializedSpark
    */
   static serialize(
      sparkPresenterOrSpark: SparkPresenter | Spark
   ): SerializedSpark {
      const spark =
         sparkPresenterOrSpark instanceof SparkPresenter
            ? sparkPresenterOrSpark
            : SparkPresenter.createFromFirebaseObject(sparkPresenterOrSpark)
      return {
         ...spark,
         createdAt: spark.createdAt ? spark.createdAt.getTime() : null,
         updatedAt: spark.updatedAt ? spark.updatedAt.getTime() : null,
         publishedAt: spark.publishedAt ? spark.publishedAt.getTime() : null,
      }
   }

   /**
    * Convert from SparkPresenter or Spark to firebase document data
    * @param sparkPresenter
    * @returns firebase document data
    * @example
    */
   static toFirebaseObject(sparkPresenter: SparkPresenter): Spark {
      return {
         ...sparkPresenter,
         createdAt: sparkPresenter.createdAt
            ? Timestamp.fromDate(sparkPresenter.createdAt)
            : null,
         updatedAt: sparkPresenter.updatedAt
            ? Timestamp.fromDate(sparkPresenter.updatedAt)
            : null,
         publishedAt: sparkPresenter.publishedAt
            ? Timestamp.fromDate(sparkPresenter.publishedAt)
            : null,
      }
   }
}

export const sparkPresenterConverter: FirestoreDataConverter<SparkPresenter> = {
   toFirestore: (sparkPresenter: SparkPresenter) => {
      return SparkPresenter.toFirebaseObject(sparkPresenter)
   },
   fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options)
      data.id = snapshot.id
      return SparkPresenter.createFromFirebaseObject(data)
   },
}
