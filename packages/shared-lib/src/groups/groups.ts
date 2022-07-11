import { Identifiable } from "../commonTypes"

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
   privacyPolicyActive?: boolean
}

export interface GroupCategory extends Identifiable {
   name: string
   options: GroupOption[]
}

export interface GroupOption extends Identifiable {
   name: string
}

/*
 * A a category document found in a sub-collection called "customCategories"
 * of the Group Document
 * */
export interface CustomCategory extends Identifiable {
   name: string
   options: Record<CustomCategoryOption["id"], CustomCategoryOption>
}

/**
 * A university category option stored in an
 * array field of the UniversityCategory document
 * called "options".
 */
export interface CustomCategoryOption extends Identifiable {
   name: string
}

export interface GroupUserStat {
   totalCount: number
   id: string
   label: string
   dataDict: Record<GroupUserStatData["optionId"], GroupUserStatData>
   dataArray: GroupUserStatData[]
}
export interface GroupUserStatData {
   count: number
   optionName: string
   optionId: string
}
