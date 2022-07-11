import { Identifiable } from "../commonTypes"
import firebase from "firebase"
import { CustomCategory, CustomCategoryOption } from "../groups"

export interface UserData extends Identifiable {
   authId: string
   firstName: string
   lastName: string
   fieldOfStudy?: {
      name: string
      id: string
   }
   levelOfStudy?: {
      name: string
      id: string
   }
   university: {
      code: string
      name: string
      categories: UniversityCategoriesMap
   }
   badges?: string[]
   groupIds: string[]
   registeredGroups?: RegisteredGroup[]
   linkedinUrl: string
   isAdmin?: boolean
   userResume: string
   backFills: BackFillType[] | firebase.firestore.FieldValue
   universityCountryCode: string
   unsubscribed?: boolean
   userEmail: string
   validationPin: number
   interestsIds?: string[]
   points?: number
   referralCode?: string
   referredBy?: {
      uid: string
      name: string
   }

   // need data migrations to be moved to the user stats doc
   referralsCount?: number
   totalLivestreamInvites?: number
}

export interface UniversityCategoriesMap {
   [categoryId: CustomCategory["id"]]: {
      categoryName?: string
      selectedOptionName?: string
      selectedOptionId: CustomCategoryOption["id"]
   }
}
export type BackFillType = "levelOfStudy" | "fieldOfStudy"
export interface RegisteredGroup {
   groupId: string
   categories: RegisteredGroupCategory[]
}

export interface RegisteredGroupCategory {
   id: string
   selectedValueId: string
}

export interface UserStats {
   userId: string
   totalLivestreamAttendances?: number
   totalQuestionsAsked?: number
   totalHandRaises?: number
}

export interface SavedRecruiter extends Identifiable {
   livestreamId: string
   userId: string
   savedAt: firebase.firestore.Timestamp

   livestreamDetails: {
      title: string
      company: string
      start: firebase.firestore.Timestamp
      companyLogoUrl: string
   }

   streamerDetails: {
      id: string
      avatar?: string
      linkedIn?: string
      firstName: string
      lastName: string
      position: string
      background?: string
   }
}

export interface RegisteredStudent extends UserData {
   dateRegistered: firebase.firestore.Timestamp
}

export interface UserPublicData {
   id: string
   firstName: string
   lastName: string
   badges?: string[]
}

/**
 * Public information about a user
 *
 * Useful to save on relationship documents
 * @param userData
 */
export const pickPublicDataFromUser = (userData: UserData): UserPublicData => {
   return {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      badges: userData.badges || [],
   }
}
