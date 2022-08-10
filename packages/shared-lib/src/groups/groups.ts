import { Identifiable } from "../commonTypes"
import { convertDictToDocArray } from "../BaseFirebaseRepository"
import { dynamicSort } from "../utils"
import firebase from "firebase/compat/app"

// CareerCenterData collection
export interface Group extends Identifiable {
   // required
   groupId: string
   description: string
   logoUrl: string
   adminEmails: string[]
   adminEmail?: string

   // optional
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

   /*
    * Deprecated
    * */
   categories?: GroupCategory[]
}

export interface GroupWithPolicy extends Group {
   needsToAgree: boolean
}
export interface GroupCategory extends Identifiable {
   name: string
   hidden?: boolean
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

/**
 * Document that lives in /careerCenterData/:id/ats/:integrationId
 * Contains information about the ATS integration for a single linked account
 *
 * When supporting multiple providers (others than merge) just add a new map key
 */
export interface GroupATSAccountDocument extends Identifiable {
   groupId: string
   merge?: {
      end_user_origin_id?: string
      integration_name?: string
      image?: string
      square_image?: string
      color?: string
      slug?: string
      lastFetchedAt?: firebase.firestore.Timestamp
   }
   createdAt: firebase.firestore.Timestamp
   updatedAt: firebase.firestore.Timestamp
}

/**
 * Document that lives in /careerCenterData/:id/ats/:integrationId/tokens/tokens
 * Contains sensitive tokens used to fetch data in the company behalf
 * (in case of merge, it also requires our own api key that's injected to the cloud functions)
 *
 * This data shouldn't be fetched via apps (webapp), only via backends (cloud functions)
 */
export interface GroupATSIntegrationTokensDocument extends Identifiable {
   groupId: string
   integrationId: string
   merge?: {
      account_token?: string
   }
}
