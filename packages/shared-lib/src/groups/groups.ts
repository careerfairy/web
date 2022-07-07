import { Identifiable } from "../commonTypes"
import firebase from "firebase"

// CareerCenterData collection
export interface Group extends Identifiable {
   // required
   groupId: string
   description: string
   logoUrl: string
   adminEmails: string[]
   adminEmail?: string

   // optional
   categories: GroupCategory[]
   extraInfo?: string
   partnerGroupIds?: string[]
   rank?: number
   test?: boolean
   universityCode?: string
   universityId?: string
   universityName?: string
   hidePrivateEventsFromEmbed?: boolean
}

export interface GroupCategory extends Identifiable {
   name: string
   options: GroupOption[]
}

export interface GroupOption extends Identifiable {
   name: string
}

export interface GroupATSInformation {
   groupId: string
   merge?: {
      end_user_origin_id?: string
      integration_name?: string
   }
   updatedAt: firebase.firestore.Timestamp
}
