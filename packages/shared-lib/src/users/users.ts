import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat/app"

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
   }

   // need data migrations to be moved to the user stats doc
   referralsCount?: number
   totalLivestreamInvites?: number
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

/**
 * Document /userData/{id}/ats/ats
 *
 * Will store the user ATS existent relationships
 */
export interface UserATSDocument {
   userId: string

   // Map of AccountIds -> ATS Object IDs
   // Stores the relation between each group linked account (Greenhouse, Teamtailor, etc)
   // and Merge objects (Candidate id, Attachment ids, etc)
   // We'll be able to answer the questions:
   // - The user already has a Candidate ATS Model on the group TeamTailor account?
   // - The user has already applied for a certain job?
   atsRelations?: { [index: string]: UserATSRelations }
}

export interface UserATSRelations {
   candidateId?: string
   cvAttachmentId?: string
   // map job id -> application id
   jobApplications?: { [jobId: string]: string }
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
