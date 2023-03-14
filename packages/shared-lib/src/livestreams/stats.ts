import { Identifiable } from "../commonTypes"
import {
   LivestreamEvent,
   LivestreamEventPublicData,
   pickPublicDataFromLivestream,
} from "./livestreams"
import { FlattenPaths } from "../utils/types"

// Document Path: livestreams/{livestreamId}/stats/livestreamStats
export interface LiveStreamStats extends Identifiable {
   livestream: LivestreamEventPublicData

   /**
    * Map with the aggregated ratings for each rating question
    */
   ratings?: {
      [ratingId: string]: LivestreamStatsRatingMap
   }

   /**
    * The overall stats of the event
    * */
   generalStats: LivestreamStatsMap

   universityStats: {
      // The key is the university code, and the value is the stats for that university.
      // The numberOfPeopleReached will be zero because it is not relevant for the university stats
      [universityCode: string]: LivestreamStatsMap
   }
   countryStats: {
      // The key is the country code, and the value is the stats for that country
      [countryCode: string]: LivestreamStatsMap
   }
   fieldOfStudyStats: {
      // The key is the field of study, and the value is the stats for that field of study
      [fieldOfStudyId: string]: LivestreamStatsMap
   }
}

export const createLiveStreamStatsDoc = (
   livestream: LivestreamEvent,
   docId: string
): LiveStreamStats => {
   return {
      id: docId,
      livestream: pickPublicDataFromLivestream(livestream),
      generalStats: {
         numberOfApplicants: 0,
         numberOfParticipants: 0,
         numberOfPeopleReached: 0,
         numberOfRegistrations: 0,
         numberOfTalentPoolProfiles: 0,
      },
      universityStats: {},
      countryStats: {},
      fieldOfStudyStats: {},
   }
}

export type LivestreamStatsMap = {
   // Total number of views across all live stream details pages
   numberOfPeopleReached: number
   // Total number of registrations across all live streams
   numberOfRegistrations: number
   // Total number of people who have participated in the live stream
   numberOfParticipants: number
   // Total number of people that joined the talent pool
   numberOfTalentPoolProfiles: number
   // Total number of applications that came in through the ATS integration
   numberOfApplicants: number
}

export type LivestreamStatsRatingMap = {
   /**
    * Number of users who have rated the event
    * */
   numberOfRatings: number

   /**
    * The average aggregate rating of the event
    * This value is between 1 and 5
    *
    * Includes normal & sentiment rantings
    * */
   averageRating: number
}

export type NestedObjectOptions = {
   statsObjectKey?: keyof Pick<
      LiveStreamStats,
      "universityStats" | "fieldOfStudyStats" | "countryStats"
   >
   statsObjectProperty?: string
}

/**
 * The properties on the LiveStreamStats object that are maps of stats
 */
export type LivestreamStatsMapKey = keyof Pick<
   LiveStreamStats,
   "universityStats" | "fieldOfStudyStats" | "countryStats"
>

type AllPossibleLivestreamStatsPaths = FlattenPaths<LiveStreamStats> // "generalStats.numberOfPeopleReached" | "universityStats.123.numberOfPeopleReached"

export type LivestreamStatsKey = keyof LivestreamStatsMap
export const getAValidLivestreamStatsUpdateField = (
   field: keyof LiveStreamStats[LivestreamStatsMapKey][string],
   options?: NestedObjectOptions
): Extract<
   AllPossibleLivestreamStatsPaths,
   | `universityStats.${string}.${LivestreamStatsKey}`
   | `fieldOfStudyStats.${string}.${LivestreamStatsKey}`
   | `countryStats.${string}.${LivestreamStatsKey}`
   | `generalStats.${LivestreamStatsKey}`
> => {
   if (options) {
      return `${options.statsObjectKey}.${options.statsObjectProperty}.${field}` as const
   }
   return `generalStats.${field}` as const
}

export type LivestreamStatsToUpdate = {
   // The operations to make to the nested properties on the livestreamStats document
   [stringToPropertyInDotNotation: string]: unknown
}
