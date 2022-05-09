import { Identifiable } from "../commonTypes"

export interface UserData extends Identifiable {
   authId: string
   firstName: string
   lastName: string
   university: {
      code: string
      name: string
   }
   badges: string[]
   groupIds: string[]
   linkedinUrl: string
   isAdmin: boolean
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
   referralsCount?: number
}
