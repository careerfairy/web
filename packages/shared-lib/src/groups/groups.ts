import { Identifiable } from "../commonTypes"
import { convertDictToDocArray } from "../BaseFirebaseRepository"
import { dynamicSort } from "../utils"

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
   privacyPolicyUrl?: string
}

export interface GroupWithPolicy extends Group {
   needsToAgree: boolean
}
export interface GroupCategory extends Identifiable {
   name: string
   options: GroupOption[]
}

export interface GroupOption extends Identifiable {
   name: string
}

/*
 * A a group question document found in a sub-collection called "groupQuestions"
 * of the Group Document
 * */
export interface GroupQuestion extends Identifiable {
   name: string
   hidden?: boolean
   // This property is used to determine if the category is can or cant
   // be deleted, levelOfStudy and fieldOfStudy types should not be deleted
   // for the sake of pdf reporting.
   questionType: "levelOfStudy" | "fieldOfStudy" | "custom"
   options: Record<GroupQuestionOption["id"], GroupQuestionOption>
}

/**
 * A university category option stored in an
 * array field of the UniversityCategory document
 * called "options".
 */
export interface GroupQuestionOption extends Identifiable {
   name: string
}

/*
 * Returns the same options dictionary, but sorted
 * by the option name.
 * */
export const sortGroupQuestionOptionsByName = (
   groupQuestionOption: GroupQuestion["options"]
): GroupQuestion["options"] =>
   convertGroupQuestionOptionsToSortedArray(groupQuestionOption).reduce(
      (accumulator, option) => {
         accumulator[option.id] = groupQuestionOption[option.id]
         return accumulator
      },
      {}
   )

export const convertGroupQuestionOptionsToSortedArray = (
   optionsDict: GroupQuestion["options"],
   sortProperty: keyof GroupQuestionOption = "name"
): GroupQuestionOption[] => {
   return convertDictToDocArray(optionsDict).sort(dynamicSort(sortProperty))
}
