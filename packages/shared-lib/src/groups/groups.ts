import { Identifiable, ImageType } from "../commonTypes"
import { convertDictToDocArray } from "../BaseFirebaseRepository"
import { dynamicSort } from "../utils"
import firebase from "firebase/compat/app"
import { UserData } from "../users"
import { MergeExtraRequiredData } from "../ats/merge/MergeResponseTypes"

// CareerCenterData collection
export interface Group extends Identifiable {
   // required
   groupId: string
   description: string
   logoUrl: string

   logo?: ImageType
   banner?: ImageType

   // optional
   extraInfo?: string
   partnerGroupIds?: string[]
   rank?: number
   test?: boolean
   universityCode?: string
   universityId?: string
   universityName?: string
   normalizedUniversityName?: string
   hidePrivateEventsFromEmbed?: boolean
   privacyPolicyActive?: boolean
   privacyPolicyUrl?: string
   inActive?: boolean
   bannerImageUrl?: string
   atsAdminPageFlag?: boolean
   careerPageUrl?: string
   /*
    * This flag is used to determine if the group has access to sparks
    * */
   sparksAdminPageFlag?: boolean
   maxPublicSparks?: number
   publicSparks?: boolean
   /*
    * Metadata for the group
    * */
   companyCountry?: GroupOption
   companyIndustries?: GroupOption[]
   companySize?: string
   targetedCountries?: GroupOption[]
   targetedUniversities?: GroupTargetUniversity[]
   targetedFieldsOfStudy?: GroupOption[]

   /*
    * Photos that are displayed on the group company page
    * */
   photos?: GroupPhoto[]
   /*
    * Videos that are displayed on the group company page
    * */
   videos?: GroupVideo[]
   publicProfile?: boolean
   testimonials?: Testimonial[]

   /**
    * A map of all the trigrams from joining the group universityName
    * and the description. Used for full text search
    */
   triGrams: Record<string, true>

   /**
    * Group plan properties
    * */
   plan?: GroupPlan

   /**
    * Deprecated
    * */
   categories?: GroupCategory[] // deprecated
   adminEmails?: string[] // deprecated
   adminEmail?: string // deprecated
}

export const GroupPlanTypes = {
   Trial: "trial",
   Sparks: "sparks",
} as const

export type GroupPlanType = (typeof GroupPlanTypes)[keyof typeof GroupPlanTypes]

export type GroupPlan = {
   // The type of the group plan.
   type: GroupPlanType
   // The timestamp when the group plan started, or null if the group plan has not started yet.
   startedAt: firebase.firestore.Timestamp | null
   // The timestamp when the group plan expires, or null if the group plan does not expire. Can be overwritten by CF admin.
   expiresAt: firebase.firestore.Timestamp | null
}

export type GroupTargetUniversity = GroupOption & {
   country: string
}

export interface Testimonial extends Identifiable {
   id: string // uuid
   name: string
   position: string
   testimonial: string
   avatar: string
   groupId: string
}

export interface GroupPhoto extends Identifiable {
   url: string
}

export interface GroupVideo extends Identifiable {
   url: string
   title: string
   description: string
   isEmbedded: boolean
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
      // used to confirm if the first sync is complete for the integration
      firstSyncCompletedAt?: firebase.firestore.Timestamp
      // confirm the application test was completed
      // required to be able to associate jobs with livestreams
      applicationTestCompletedAt?: firebase.firestore.Timestamp
      lastFetchedAt?: firebase.firestore.Timestamp
      extraRequiredData?: MergeExtraRequiredData
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

/*
 * Key is the questionId and value is the answerId
 * */
export type UserGroupQuestionsWithAnswerMap = Record<
   GroupQuestion["id"],
   string
>

export interface UserGroupData extends Identifiable {
   userUid?: UserData["authId"]
   groupId: Group["id"]
   groupName: Group["universityName"]
   groupLogo: Group["logoUrl"]
   groupUniversityCode?: Group["universityCode"]
   questions?: UserGroupQuestionsWithAnswerMap
}

/*
 * LEGACY ADMIN SUB-COLLECTION careerCenterData/[groupId]/admins/[adminEmail]
 * Will be used by migration script PR
 * */
export interface LegacyGroupAdmin extends Identifiable {
   role: "mainAdmin" | "subAdmin"
}

// careerCenterData/[groupId]/groupAdmins/[adminEmail]
export interface GroupAdmin extends Identifiable {
   role: GROUP_DASHBOARD_ROLE
   firstName: string
   lastName: string
   displayName: string
   email: string
   groupId: string
}

export enum GROUP_DASHBOARD_ROLE {
   OWNER = "OWNER",
   MEMBER = "MEMBER",
}

export type PublicGroup = Pick<
   Group,
   | "id"
   | "description"
   | "logoUrl"
   | "extraInfo"
   | "universityName"
   | "universityCode"
   | "publicSparks"
   | "publicProfile"
   | "careerPageUrl"
>

export const pickPublicDataFromGroup = (group: Group): PublicGroup => {
   return {
      id: group.id,
      description: group.description ?? null,
      logoUrl: group.logoUrl ?? null,
      extraInfo: group.extraInfo ?? null,
      universityName: group.universityName ?? null,
      universityCode: group.universityCode ?? null,
      publicSparks: group.publicSparks ?? null,
      publicProfile: group.publicProfile ?? false,
      careerPageUrl: group.careerPageUrl ?? null,
   }
}

export const buildTestimonialsArray = (values, groupId) => {
   return Object.keys(values.testimonials).map((key) => {
      return {
         groupId,
         id: values.testimonials[key]?.id || key,
         avatar: values.testimonials[key].avatar,
         name: values.testimonials[key].name,
         position: values.testimonials[key].position,
         testimonial: values.testimonials[key].testimonial,
      }
   })
}

/**
 * A group admin info object that is used to send emails to group admins
 */
export type GroupAdminNewEventEmailInfo = {
   /**
    * The ID of the admin's group
    */
   groupId: string
   /**
    * The email of the admin
    */
   email: string
   /**
    * Link to the event in their dashboard
    */
   eventDashboardLink: string
   /**
    * Link to the public live stream event page in the platform
    */
   nextLivestreamsLink: string
}
