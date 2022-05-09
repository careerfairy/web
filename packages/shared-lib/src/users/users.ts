import { Identifiable } from "../commonTypes"
import firebase from "firebase"

export interface UserData extends Identifiable {
   authId: string
   firstName: string
   lastName: string
   university: {
      code: string
      name: string
   }
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
   referralsCount?: number
   livestreamsAttendances?: number
   badges?: string[]
   isAdmin?: boolean
}

export interface SavedRecruiter extends Identifiable {
   livestreamId: string
   userId: string
   savedAt: firebase.firestore.Timestamp

   livestreamDetails: {
      title: string
      company: string
      summary: string
      start: firebase.firestore.Timestamp
      companyLogoUrl: string
   }

   streamerDetails: {
      id: string
      avatar: string
      linkedIn: string
      firstName: string
      lastName: string
      position: string
      background: string
   }
}
