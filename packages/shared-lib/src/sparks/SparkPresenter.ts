import {
   DocumentData,
   FirestoreDataConverter,
   Timestamp,
} from "firebase/firestore"
import { fromSerializedDate } from "../BaseModel"
import {
   SerializedPublicGroup,
   deserializePublicGroup,
   serializePublicGroup,
} from "../groups"
import { imageKitLoader } from "../utils/video"
import { Spark, SparkCategory, SparkLanguage, SparkVideo } from "./sparks"

interface SparkPresenterInterface
   extends Omit<
      Spark,
      "createdAt" | "updatedAt" | "publishedAt" | "addedToFeedAt"
   > {
   createdAt: Date
   updatedAt: Date
   publishedAt: Date
   addedToFeedAt: Date
}

export interface SerializedSpark
   extends Omit<
      Spark,
      "createdAt" | "updatedAt" | "publishedAt" | "addedToFeedAt" | "group"
   > {
   createdAt: number
   updatedAt: number
   publishedAt: number
   addedToFeedAt: number
   group: SerializedPublicGroup
}

export enum SparkCardNotificationTypes {
   /**
    * Notification to convert logged out users
    */
   CONVERSION = "conversion",
   /**
    * Default notification to be displayed at the end of group content
    */
   GROUP = "group",
   /**
    * Notification to be displayed at the end of group content if the company does have any upcoming live stream
    */
   EVENT = "event",
   /**
    * Default notification to be displayed at the end of creator content
    */
   CREATOR = "creator",
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
 */
export class SparkPresenter implements SparkPresenterInterface {
   id: string
   group: Spark["group"]
   creator: Spark["creator"]
   createdAt: Date
   updatedAt: Date
   publishedAt: Date
   addedToFeedAt: Date
   published: boolean
   category: SparkCategory
   language: SparkLanguage
   question: string
   video: SparkVideo

   // Additional properties can be added here as the Spark structure evolves
   isCardNotification?: boolean
   cardNotificationType?: SparkCardNotificationTypes
   hasJobs?: boolean

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
    * Gets the video URL with the appropriate transformations. 16:9 aspect ratio, 640x360, 50% quality.
    */
   getTransformedVideoUrl(): string {
      return imageKitLoader({
         src: this.video.url,
         height: 640 * 3,
         width: 360 * 3,
         quality: 40,
         maxSizeCrop: true,
      })
   }

   /**
    * Converts plain objects to SparkPresenter class instances, transforming serialized dates back into Date objects.
    * @param serializedSpark Plain object with serialized dates.
    * @returns {SparkPresenter} SparkPresenter instance.
    */
   static deserialize(serializedSpark: SerializedSpark): SparkPresenter {
      return new SparkPresenter({
         ...serializedSpark,
         createdAt: fromSerializedDate(serializedSpark.createdAt),
         updatedAt: fromSerializedDate(serializedSpark.updatedAt),
         publishedAt: fromSerializedDate(serializedSpark.publishedAt),
         addedToFeedAt: fromSerializedDate(serializedSpark.addedToFeedAt),
         group: deserializePublicGroup(
            serializedSpark.group,
            Timestamp.fromDate
         ),
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
         addedToFeedAt: firebaseObject.addedToFeedAt
            ? firebaseObject.addedToFeedAt.toDate()
            : null,
      })
   }

   /**
    * Converts a SparkPresenter instance (or a Spark) to a serialized format suitable for client-server communication.
    * @param sparkPresenterOrSpark SparkPresenter instance or Spark.
    * @returns {SerializedSpark} Serialized version of the input.
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
         addedToFeedAt: spark.addedToFeedAt
            ? spark.addedToFeedAt.getTime()
            : null,
         group: serializePublicGroup(spark.group),
      }
   }

   /**
    * Converts a SparkPresenter instance to a format that's compatible with Firestore's storage,
    * specifically transforming JavaScript Dates into Firestore Timestamps.
    * @param sparkPresenter SparkPresenter instance.
    * @returns {Spark} Converted Spark for Firestore storage.
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
         addedToFeedAt: sparkPresenter.addedToFeedAt
            ? Timestamp.fromDate(sparkPresenter.addedToFeedAt)
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
