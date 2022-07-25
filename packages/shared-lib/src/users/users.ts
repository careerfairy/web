import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat/app"
import FieldValue = firebase.firestore.FieldValue

export interface UserData extends Identifiable {
   authId: string
   firstName: string
   lastName: string
   university: {
      code: string
      name: string
   }
   badges?: string[]
   groupIds: string[]
   linkedinUrl: string
   isAdmin?: boolean
   userResume: string
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
      referralCode: string
   }

   // need data migrations to be moved to the user stats doc
   referralsCount?: number
   totalLivestreamInvites?: number
   gender?: string
   spokenLanguages?: string[]
   countriesOfInterest?: string[]
   regionsOfInterest?: string[]
   isLookingForJob?: boolean
   fieldOfStudy?: string
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

export type ReferralData = {
   uid: string
   name: string
   referralCode: string
}
export type AdditionalInformationProps = {
   userEmail: string
   gender?: string
   spokenLanguages?: string[]
   countriesOfInterest?: string[]
   regionsOfInterest?: string[]
   interestsIds?: string[]
   isLookingForJob?: boolean
   linkedinUrl?: string
   referredBy?: ReferralData
   fieldOfStudy?: string
}

export type RegistrationStep = {
   userId: string
   steps: string[]
   totalSteps: number
   updatedAt: FieldValue
}

export type UserDataAnalytics = {
   registrationSteps: RegistrationStep
} & Identifiable

export type RegistrationStepAnalyticsProps = {
   userEmail: string
   stepId: string
   totalSteps: number
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
