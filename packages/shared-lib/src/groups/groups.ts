import { Identifiable } from "../commonTypes"

// CareerCenterData collection
export interface Group extends Identifiable {
   // required
   groupId: string
   description: string
   logoUrl: string
   adminEmails: string[]

   // optional
   categories: GroupCategory[]
   extraInfo?: string
   partnerGroupIds?: string[]
   rank?: number
   test?: boolean
   universityCode?: string
   universityId?: string
   universityName?: string
}

export interface GroupCategory extends Identifiable {
   name: string
   options: GroupOption[]
}

export interface GroupOption extends Identifiable {
   name: string
}
