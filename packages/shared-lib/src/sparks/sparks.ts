import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"
import { PublicGroup } from "../groups"
import { PublicCreator } from "../groups/creators"

/**
 * Collection path: /sparks
 */
export interface Spark extends Identifiable {
   // embedded group public information
   group: PublicGroup

   // embedded creator public information
   creator: PublicCreator

   createdAt: Timestamp
   updatedAt: Timestamp
   publishedAt: Timestamp

   /**
    * We can filter sparks by its published state:
    * - false: spark is created but not published
    * - true: spark is ready
    */
   published: boolean

   /**
    * Category
    * e.g: Day in the life, Jobs, Role, Application
    */
   category: SparkCategory

   /**
    * Description / Question of the spark
    */
   question: string

   /**
    * Video Identifier
    *
    * Used to construct the video url
    * https://firebase.storage/sparks/[videoId]/[videoId].mp4
    */
   videoId: string // uuid generated during upload

   // in case we want to override the video with an external one
   videoUrl: string | null // we can have a default video while in the processing state

   /**
    * KPIs
    */
   // count how many times we list the spark in the feed
   // using fingerprinting
   impressions: number

   // counting the unique number of times the spark starts playing
   // If logged in, we use the user id
   // otherwise we use fingerprinting
   uniquePlays: number

   // counting the number of times the spark is clicked / opened
   // increments every time the spark starts playing
   plays: number

   // Sum of watched minutes
   totalWatchedMinutes: number // floating point

   // signed in user user likes
   likes: number

   // how many times the share action is clicked
   shareCTA: number

   // possible future fields

   // video metadata
   // videoDurationMs?: number
   // videoSizeBytes?: number
}

export type SparkVisibility = "public" | "private"

export type AddSparkSparkData = Pick<
   Spark,
   "question" | "category" | "videoId" | "videoUrl" | "creator"
>

export type UpdateSparkData = Pick<Spark, "question" | "category" | "id">

export const SparksCategories = {
   CompanyCulture: {
      id: "company-culture",
      name: "Company Culture",
   },
   Application: {
      id: "application",
      name: "Application",
   },
   DayInTheLife: {
      id: "day-in-the-life",
      name: "Day in the Life",
   },
   Jobs: {
      id: "jobs",
      name: "Jobs",
   },
   Role: {
      id: "role",
      name: "Role",
   },
} as const

export const getCategoryEmoji = (categoryId: SparkCategory["id"]) => {
   switch (categoryId) {
      case SparksCategories.Application.id:
         return "🚀"
      case SparksCategories.CompanyCulture.id:
         return "👨‍🎤"
      case SparksCategories.DayInTheLife.id:
         return "😎"
      case SparksCategories.Jobs.id:
         return "💼"
      case SparksCategories.Role.id:
         return "🧑‍💼"
      default:
         return ""
   }
}

export type SparkCategory =
   (typeof SparksCategories)[keyof typeof SparksCategories]
