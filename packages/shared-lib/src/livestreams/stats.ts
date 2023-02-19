import { Identifiable } from "../commonTypes"
import { sortLivestreamsDesc } from "../utils"
import { LivestreamPresenter } from "./LivestreamPresenter"
import {
   LivestreamEvent,
   LivestreamEventPublicData,
   pickPublicDataFromLivestream,
} from "./livestreams"

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
}

export const serializeLiveStreamStats = (doc: LiveStreamStats) => {
   return {
      ...doc,
      livestream: LivestreamPresenter.serializeDocument(
         doc.livestream as LivestreamEvent
      ),
   }
}

export const deserializeLiveStreamStats = (doc: LiveStreamStats) => {
   return {
      ...doc,
      livestream: LivestreamPresenter.createFromPlainObject(
         doc.livestream as any // ignore ts compiler warning about this conversion
      ),
   }
}

export const createLiveStreamStatsDoc = <T extends string>(
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

export const getAValidLivestreamStatsUpdateField = <TUniCode extends string>(
   field: keyof LivestreamStatsMap,
   universityCode?: TUniCode
):
   | `${keyof Pick<
        LiveStreamStats,
        "universityStats"
     >}.${TUniCode}.${keyof LivestreamStatsMap}`
   | `${keyof Pick<
        LiveStreamStats,
        "generalStats"
     >}.${keyof LivestreamStatsMap}` => {
   if (universityCode) {
      return `universityStats.${universityCode}.${field}` as const
   }
   return `generalStats.${field}` as const
}

export type LivestreamStatsToUpdate = {
   // The operations to make to the nested properties on the livestreamStats document
   [stringToPropertyInDotNotation: string]: unknown
}

/**
 * Sort the livestream stats by most recent livestreams
 */
export const sortStatsByMostRecentLivestreams = (
   stats: LiveStreamStats[],
   reverse = false
) => {
   return stats?.sort((a, b) => {
      return sortLivestreamsDesc(
         a?.livestream as LivestreamEvent,
         b?.livestream as LivestreamEvent,
         reverse
      )
   })
}
