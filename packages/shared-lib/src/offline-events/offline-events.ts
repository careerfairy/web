import { GeoPoint } from "firebase/firestore"
import { Identifiable } from "../commonTypes"
import { FieldOfStudy, LevelOfStudy } from "../fieldOfStudy"
import { Timestamp } from "../firebaseTypes"
import { GroupOption, PublicGroup } from "../groups"
import { AuthorInfo } from "../livestreams"
import { University } from "../universities"

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

export interface OfflineEvent extends Identifiable {
   group: PublicGroup
   author: AuthorInfo
   title: string
   description: string
   address: OfflineEventAddress
   industries: GroupOption[]
   targetAudience: OfflineEventTargetAudience
   status: OfflineEventStatus
   registrationUrl: string
   startAt: Timestamp
   createdAt: Timestamp
   updatedAt: Timestamp
   lastUpdatedBy: AuthorInfo
   backgroundImageUrl?: string
   hidden?: boolean
}

export interface OfflineEventTargetAudience {
   universities: UniversityOption[]
   levelOfStudies: LevelOfStudy[]
   fieldOfStudies: FieldOfStudy[]
}
