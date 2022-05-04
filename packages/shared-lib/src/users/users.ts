import { Identifiable } from "../commonTypes"

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
   savedAt: Date

   livestreamDetails: {
      title: string
      companyName: string
      description: string
      start: Date
      imageUrl: string
   }

   streamerDetails: {
      profilePic: string
      linkedinUrl: string
      firstName: string
      lastName: string
      occupation: string
   }
}
