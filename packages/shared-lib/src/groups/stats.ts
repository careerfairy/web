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
      [universityCode: string]: GroupStatsMap
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
         numberOfPeopleReachedCompanyPage: 0,
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
   // Total number of people reached by the company page of the group
   numberOfPeopleReachedCompanyPage: number
}

export const getAValidGroupStatsUpdateField = <TUniCode extends string>(
   field: keyof GroupStatsMap,
   universityCode?: TUniCode
):
   | `${keyof Pick<
        GroupStats,
        "universityStats"
     >}.${TUniCode}.${keyof GroupStatsMap}`
   | `${keyof Pick<GroupStats, "generalStats">}.${keyof GroupStatsMap}` => {
   if (universityCode) {
      return `universityStats.${universityCode}.${field}` as const
   }
   return `generalStats.${field}` as const
}
