import { Identifiable } from "../commonTypes"
import { Group, pickPublicDataFromGroup, PublicGroup } from "./groups"

// Document Path: careerCenterData/{groupId}/stats/groupStats
export interface GroupStats extends Identifiable {
   group: PublicGroup
   /**
    * The overall stats of the event
    * */
   generalStats: GroupStatsMap
   universityStats: {
      // The key is the university code, and the value is the stats for that university. We exclude numberOfPeopleReached because it is not relevant for the university stats
      [universityCode: string]: Omit<GroupStatsMap, "numberOfPeopleReached">
   }
}

export const createGroupStatsDoc = <T extends string>(
   group: Group,
   docId: string
): GroupStats => {
   return {
      id: docId,
      group: pickPublicDataFromGroup(group),
      generalStats: {
         numberOfParticipants: 0,
         numberOfPeopleReached: 0,
         numberOfRegistrations: 0,
      },
      universityStats: {},
   }
}

export type GroupStatsMap = {
   // Total number of views across all live stream details pages for every livestream of the group
   numberOfPeopleReached: number
   // Total number of registrations across all live streams for every livestream of the group
   numberOfRegistrations: number
   // Total number of people who have participated in the live stream for every livestream of the group
   numberOfParticipants: number
}

type GeneralStatsKey = keyof Pick<GroupStats, "generalStats">

type UniversityStatsKey = keyof Pick<GroupStats, "universityStats">

export function getPropertyToUpdate<TField extends keyof GroupStatsMap>(
   field: TField
): `${GeneralStatsKey}.${TField}`
export function getPropertyToUpdate<
   TField extends keyof GroupStatsMap,
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
   TField extends keyof GroupStatsMap,
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
