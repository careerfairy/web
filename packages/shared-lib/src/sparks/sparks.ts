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
    * We can filter sparks by state:
    * - created: spark is created but not published
    * - published: spark is ready
    *
    * Other possible future states:
    * - uploading / processing / error
    */
   state: "published" // string

   /**
    * Category
    * e.g: Day in the life, Jobs, Role, Application
    */
   category: {
      id: string // slug
      name: string // display name
   }

   /**
    * Description / Question of the spark
    */
   title: string

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

   /**
    * Visibility of the spark
    *
    * In the future we might add more visibilities, e.g:
    * - companyPage: visible only in the company page
    * - homepage: visible only in the homepage
    * - etc
    */
   visiblity: {
      public: boolean // true if visible in the place
   } // {place: boolean}
}

export type AddSparkSparkData = Pick<
   Spark,
   "title" | "category" | "visiblity" | "videoId" | "videoUrl" | "creator"
>

export type UpdateSparkData = Pick<
   Spark,
   "title" | "category" | "visiblity" | "id"
>
