import { Identifiable } from "../commonTypes"
import {
   LivestreamEvent,
   LivestreamEventPublicData,
   pickPublicDataFromLivestream,
} from "./livestreams"

// Document Path: livestreams/{livestreamId}/stats/livestreamStats
export interface LiveStreamStats extends Identifiable {
   livestream: LivestreamEventPublicData
   /**
    * Number of users who have rated the event
    * */
   numberOfRatings: number

   /**
    * The average aggregate rating of the event
    * */
   averageRating: number

   /**
    * The overall stats of the event
    * */
   generalStats: Stats
   universityStats: {
      // The key is the university code, and the value is the stats for that university. We exclude numberOfPeopleReached because it is not relevant for the university stats
      [universityCode: string]: Omit<Stats, "numberOfPeopleReached">
   }
}

export const createLiveStreamStatsDoc = <T extends string>(
   livestream: LivestreamEvent,
   docId: string
): LiveStreamStats => {
   return {
      id: docId,
      livestream: pickPublicDataFromLivestream(livestream),
      numberOfRatings: 0,
      averageRating: 0,
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

export type Stats = {
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

type GeneralStatsKey = keyof Pick<LiveStreamStats, "generalStats">

type UniversityStatsKey = keyof Pick<LiveStreamStats, "universityStats">

export function getPropertyToUpdate<TField extends keyof Stats>(
   field: TField
): `${GeneralStatsKey}.${TField}`
export function getPropertyToUpdate<
   TField extends keyof Stats,
   TUniversityCode extends string
>(
   field: TField,
   universityCode: TUniversityCode
): `${UniversityStatsKey}.${TUniversityCode}.${TField}`
/**
 * A helper to build a typesafe property path to update based on the field and the universityCode for the firestore UPDATE operation
 * @param field The field to update
 * @param universityCode The university code to update
 * @returns The string path in dot notation to the field to update Example: universityStats.${universityCode}.numberOfRegistrations or generalStats.numberOfRegistrations
 * */
export function getPropertyToUpdate<
   TField extends keyof Stats,
   TUniversityCode extends string | undefined
>(
   field: TField,
   universityCode?: TUniversityCode
):
   | `${UniversityStatsKey}.${TUniversityCode}.${TField}`
   | `${GeneralStatsKey}.${TField}` {
   if (universityCode) {
      return `universityStats.${universityCode}.${field}` as const
   }
   return `generalStats.${field}` as const
}
