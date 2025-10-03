import { Identifiable, UTMParams } from "../commonTypes"
import { FieldOfStudy, LevelOfStudy } from "../fieldOfStudy"
import { GeoPoint, Timestamp } from "../firebaseTypes"
import { GroupOption, PublicGroup } from "../groups"
import { AuthorInfo } from "../livestreams"
import { University } from "../universities"
import { UserData } from "../users"

export type UniversityOption = University & {
   country: string
}

export type OfflineEventStatus = "upcoming" | "draft" | "past"

export type OfflineEventAddress = {
   fullAddress: string | null
   city: string | null
   state: string | null
   stateCode: string | null
   country: string | null
   countryCode: string | null
   postcode: string | null
   placeName: string | null
   street: string | null
   streetNumber: string | null
   address_level1: string | null
   address_level2: string | null
   geoPoint: GeoPoint | null
   geoHash: string | null
}

// TODO: When creating the offline event, we should create the stats collection as well.
// collection path /offlineEvents/{offlineEventId}
export interface OfflineEvent extends Identifiable {
   group: PublicGroup
   author: AuthorInfo
   title: string
   description: string
   address: OfflineEventAddress
   industries: GroupOption[]
   targetAudience: OfflineEventTargetAudience
   published: boolean
   registrationUrl: string
   startAt: Timestamp
   createdAt: Timestamp
   updatedAt: Timestamp
   publishedAt: Timestamp
   lastUpdatedBy: AuthorInfo
   backgroundImageUrl?: string
   hidden?: boolean
}

export interface OfflineEventTargetAudience {
   universities: UniversityOption[]
   levelOfStudies: LevelOfStudy[]
   fieldOfStudies: FieldOfStudy[]
}

export const OfflineEventStatsAction = {
   Click: "click",
   View: "view",
} as const

export type OfflineEventStatsAction =
   (typeof OfflineEventStatsAction)[keyof typeof OfflineEventStatsAction]

type StatsData = {
   totalNumberOfRegisterClicks: number
   totalNumberOfTalentReached: number
   uniqueNumberOfTalentReached: number
   uniqueNumberOfRegisterClicks: number
}

// collection path /offlineEventStats/{offlineEventId}
export interface OfflineEventStats extends Identifiable {
   documentType: "offlineEventStats" // simplify groupCollection Queries
   deleted: boolean
   deletedAt: Timestamp | null
   offlineEvent: OfflineEvent
   generalStats: StatsData
   universityStats: {
      // Key format: "{countryCode}_{universityCode}" (e.g., "US_1234")
      // Both values are needed to fetch the university later
      [countryCodeAndUniversityCode: string]: StatsData
   }
   countryStats: {
      [countryCode: string]: StatsData
   }
   fieldOfStudyStats: {
      [fieldOfStudyId: string]: StatsData
   }
   updatedAt: Timestamp
}

// collection path /offlineEvent/{offlineEventId}/offlineEventUserStats/{userAuthId}
export interface OfflineEventUserStats extends Identifiable {
   documentType: "offlineEventUserStats" // simplify groupCollection Queries
   user: UserData | null // Null for anonymous users tracked by fingerprint
   offlineEvent: OfflineEvent // Probably not needed as the base document contains all the data
   isAnonymous: boolean // True if tracked via fingerprint
   // Timestamp with UTM data for when the user last saw the event
   lastSeenAt: {
      date: Timestamp
      utm: UTMParams | null
   }
   // Timestamp with UTM data for when the user clicked on the event listing
   listClickedAt: {
      date: Timestamp
      utm: UTMParams | null
   }
   createdAt: Timestamp
}

// collection path /offlineEvent/{offlineEventId}/offlineEventUserStats/{userAuthId}/offlineEventActions/{actionId}
export interface OfflineEventAction extends Identifiable {
   documentType: "offlineEventAction" // simplify groupCollection Queries
   user: UserData | null // Null for anonymous users tracked by fingerprint
   isAnonymous: boolean // True if tracked via fingerprint
   offlineEventId: string
   type: OfflineEventStatsAction
   utm: UTMParams | null
   createdAt: Timestamp
}
