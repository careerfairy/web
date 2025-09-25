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
   fullAddress: string
   city: string
   state: string
   stateCode: string
   country: string
   countryCode: string
   postcode: string
   placeName: string
   street: string
   streetNumber: string
   address_level1: string
   address_level2: string
   geoPoint: GeoPoint
   geoHash: string
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
