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

   video: SparkVideo

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

   /**
    * How many times the career page icon is clicked
    * on the Spark card
    */
   numberOfCareerPageClicks: number

   // possible future fields

   // video metadata
   // videoDurationMs?: number
   // videoSizeBytes?: number
}

/**
 * Collection path: /sparksFeed/{userId}
 */
export interface SparksFeed extends Identifiable {
   userId: string
   /**
    * Spark ids for the user feed
    */
   sparkIds: string[]
   /**
    * The number of sparks in the feed, should be equal to sparkIds.length
    */
   numberOfSparks: number
   /**
    * When last the feed was updated
    */
   lastUpdated: Timestamp
}

/**
 * Collection path: /userData/{userId}/seenSparks/2022
 * - The seen sparks are partitioned by year, so we will never hit the 1MB limit
 * - From my estimates we can have about 20'000 seen sparks on a single document before we hit the 1MB limit
 *
 * - e.g: /userData/{userId}/seenSparks/2022
 * - e.g: /userData/{userId}/seenSparks/2023
 *
 *
 * This will allow us to scale indefinitely, with very little storage cost
 */
export interface SeenSparks extends Identifiable {
   documentType: "seenSparks"
   userId: string
   sparks: {
      [sparkId: string]: Timestamp
   }
}

export const createSeenSparksDocument = (
   userId: string,
   year: string | number
): SeenSparks => ({
   documentType: "seenSparks",
   userId,
   sparks: {},
   id: year.toString(),
})

/**
 * Collection path: /deletedSparks
 */
export interface DeletedSpark extends Spark {
   deletedAt: Timestamp
}

export type SparkVideo = {
   /**
    * Video Identifier
    *
    * Used to construct the video url
    * /sparks/videos/[videoUid].mp4
    */
   uid: string

   /**
    * Video format
    *
    * Used to construct the video url
    * /sparks/[videoUid].[videoFormat]
    */
   fileExtension: string

   /**
    * Video url
    *
    * Used to construct the video url
    * https://console.firebase.google.com/u/0/project/careerfairy-e1fd9/storage/careerfairy-e1fd9.appspot.com/files/~2Fsparks~2Fvideos /[id]
    */
   url: string

   /**
    * Video thumbnail url
    *
    * Used to construct the video url
    * https://console.firebase.google.com/u/0/project/careerfairy-e1fd9/storage/careerfairy-e1fd9.appspot.com/files/~2Fsparks~2Fthumbnails /[id]
    */
   thumbnailUrl: string
}

export type SparkVisibility = "public" | "private"

export type AddSparkSparkData = {
   categoryId: Spark["category"]["id"]
   question: Spark["question"]
   video: Spark["video"]
   published: Spark["published"]
   groupId: Spark["group"]["id"]
   creatorId: Spark["creator"]["id"]
}

export type UpdateSparkData = {
   id: Spark["id"]
   categoryId: Spark["category"]["id"]
   groupId: Spark["group"]["id"]
   question: Spark["question"]
   published: Spark["published"]
   creatorId: Spark["creator"]["id"]
}

export type DeleteSparkData = {
   id: Spark["id"]
   groupId: Spark["group"]["id"]
}

export const SparksCategories = {
   CompanyCulture: {
      id: "company-culture",
      name: "Company culture",
   },
   Application: {
      id: "application",
      name: "Application process",
   },
   DayInTheLife: {
      id: "day-in-the-life",
      name: "Day in the life",
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

export const sparksCategoriesArray = Object.values(SparksCategories)

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

export const getCategoryById = (categoryId: SparkCategory["id"]) => {
   switch (categoryId) {
      case SparksCategories.Application.id:
         return SparksCategories.Application
      case SparksCategories.CompanyCulture.id:
         return SparksCategories.CompanyCulture
      case SparksCategories.DayInTheLife.id:
         return SparksCategories.DayInTheLife
      case SparksCategories.Jobs.id:
         return SparksCategories.Jobs
      case SparksCategories.Role.id:
         return SparksCategories.Role
      default:
         throw new Error(`Invalid category id: ${categoryId}`)
   }
}

export type SparkCategory =
   (typeof SparksCategories)[keyof typeof SparksCategories]
