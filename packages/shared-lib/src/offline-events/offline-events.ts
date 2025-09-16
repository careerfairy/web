import { Identifiable } from "../commonTypes"
import { CityOption, CountryOption } from "../countries/types"
import { FieldOfStudy, LevelOfStudy } from "../fieldOfStudy"
import { Timestamp } from "../firebaseTypes"
import { GroupOption } from "../groups"
import { AuthorInfo } from "../livestreams"
import { University } from "../universities"

export type UniversityOption = University & {
   country: string
}

export type OfflineEventStatus = "upcoming" | "draft" | "past"

export interface OfflineEvent extends Identifiable {
   author: AuthorInfo
   title: string
   description: string
   address: OfflineEventAddress
   company: OfflineEventCompany
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

export interface OfflineEventCompany {
   name: string
   groupId: string
}

export interface OfflineEventAddress {
   countryISOCode: CountryOption
   cityISOCode: CityOption
   street: string
}
