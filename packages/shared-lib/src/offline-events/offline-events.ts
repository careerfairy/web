import { Identifiable } from "../commonTypes"
import { FieldOfStudy, LevelOfStudy } from "../fieldOfStudy"
import { GeoPoint, Timestamp } from "../firebaseTypes"
import { GroupOption, PublicGroup } from "../groups"
import { AuthorInfo } from "../livestreams"
import { University } from "../universities"
import { UserPublicData } from "../users"

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

type PublicOfflineEvent = Omit<
   OfflineEvent,
   "author" | "lastUpdatedBy" | "updatedAt" | "publishedAt" | "createdAt"
>

export interface OfflineEventTargetAudience {
   universities: UniversityOption[]
   levelOfStudies: LevelOfStudy[]
   fieldOfStudies: FieldOfStudy[]
}

export enum OfflineEventStatsAction {
   Click = "click",
   View = "view",
}

type StatsData = {
   totalClicks: number
   totalViews: number
}

export type OfflineEventStatsMap = {
   totalTalentReached: number
   // TODO: Add other stats here
}

// collection path /offlineEvent/{offlineEventId}/stats/"offlineEventStats"/
export interface OfflineEventStats extends Identifiable {
   documentType: "offlineEventStats" // simplify groupCollection Queries
   offlineEvent: PublicOfflineEvent
   generalStats: StatsData
   universityStats: {
      [universityCode: string]: OfflineEventStatsMap
   }
   countryStats: {
      [countryCode: string]: OfflineEventStatsMap
   }
   fieldOfStudyStats: {
      [fieldOfStudyId: string]: OfflineEventStatsMap
   }
   updatedAt: Timestamp
}

// collection path /offlineEvent/{offlineEventId}/stats/"offlineEventStats"/{userAuthId}
export interface OfflineEventUserStats extends Identifiable {
   documentType: "offlineEventUserStats" // simplify groupCollection Queries
   user: UserPublicData // Or more data if needed
   offlineEvent: PublicOfflineEvent // Probably not needed as the base document contains all the data
   createdAt: Timestamp
}

// collection path /offlineEvent/{offlineEventId}/stats/"offlineEventStats"/{userAuthId}/actions
export interface OfflineEventUserStatActionsData extends Identifiable {
   documentType: "offlineEventUserStatActionsData" // simplify groupCollection Queries
   type: OfflineEventStatsAction
   offlineEvent: PublicOfflineEvent // Probably not needed as the base document contains all the data
   createdAt: Timestamp
}
