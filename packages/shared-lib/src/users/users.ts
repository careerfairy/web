import { Identifiable, UTMParams } from "../commonTypes"
import firebase from "firebase/compat/app"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupQuestion,
   GroupQuestionOption,
   PublicGroup,
   UserGroupQuestionsWithAnswerMap,
} from "../groups"
import {
   LivestreamEvent,
   LivestreamEventPublicData,
   LivestreamGroupQuestionsMap,
} from "../livestreams"
import { Job } from "../ats/Job"
import Timestamp = firebase.firestore.Timestamp
import { FieldOfStudy, LevelOfStudy } from "../fieldOfStudy"

export interface UserData extends Identifiable {
   authId: string
   firstName: string
   lastName: string
   fieldOfStudy?: FieldOfStudy
   levelOfStudy?: LevelOfStudy
   university: {
      code: string
      name: string
      questions?: UserReadableGroupQuestionsWithAnswerMap
   }
   badges?: string[]
   groupIds: string[]

   linkedinUrl: string
   isAdmin?: boolean
   userResume: string
   backFills: BackFillType[]
   universityCountryCode: string
   unsubscribed?: boolean
   userEmail: string
   // legacy field that contains an array of livestream.companyId's
   talentPools?: string[]
   validationPin: number
   interestsIds?: string[]

   // from the rewards/credit system
   // negative or positive
   credits?: number

   referralCode?: string
   referredBy?: {
      uid: string
      name: string
      referralCode: string
   }
   // need data migrations to be moved to the user stats doc
   referralsCount?: number
   totalLivestreamInvites?: number
   gender?: string
   spokenLanguages?: string[]
   countriesOfInterest?: string[]
   regionsOfInterest?: string[]
   isLookingForJob?: boolean
   accountCreationUTMParams?: UTMParams

   // temporary to hide the jobs tabs from the user profile
   // should be removed in the future
   hasJobApplications?: boolean

   /*
    * We listen to this field to know when to refetch a new fresh token in the auth provider
    * */
   refreshTokenTime?: Timestamp

   timezone?: string

   /**
    * Decommissioned field
    * User groups now live under a subcollection named userGroups
    */
   registeredGroups?: RegisteredGroup[]

   /**
    * Last user activity on any device
    */
   lastActivityAt: Timestamp
   createdAt: Timestamp
}

/*
 * Key is the questionId and value is the answerId
 * */
export type UserReadableGroupQuestionsWithAnswerMap = Record<
   GroupQuestion["id"],
   ReadableQuestionAndAnswer
>

export interface ReadableQuestionAndAnswer {
   questionName: GroupQuestion["name"]
   questionId: GroupQuestion["id"]
   answerId: GroupQuestionOption["id"]
   answerName: GroupQuestionOption["name"]
}

export interface CSVDownloadUserData extends Record<string, string> {
   Email: string
   "Field of study": string
   "First Name": string
   "Last Name": string
   "Level of study": string
   University: string
}

export type BackFillType = "levelOfStudy" | "fieldOfStudy"

export interface RegisteredGroup {
   groupId: string
   categories: RegisteredGroupCategory[]
}

export interface RegisteredGroupCategory {
   id: string
   selectedValueId: string
}

export interface UserStats {
   userId: string
   totalLivestreamAttendances?: number
   totalQuestionsAsked?: number
   totalHandRaises?: number
   hasRegisteredOnAnyLivestream?: boolean
   totalLivestreamInvites?: number
   referralsCount?: number
   recordingsBought?: string[]
}

export interface SavedRecruiter extends Identifiable {
   livestreamId: string
   userId: string
   savedAt: Timestamp

   livestreamDetails: {
      title: string
      company: string
      start: Timestamp
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
 * Document that sets the user as part of a talent pool for a group
 * Mainly used for the group analytics
 *
 * /userData/:id/talentProfiles/:groupId
 */
export interface TalentProfile extends Identifiable {
   groupId: string
   userId: string
   userEmail: string
   user: UserData
   mostRecentLivestream: LivestreamEvent
   joinedAt: Timestamp
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

/*
 * Key is the groupId and value is a dictionary of keys questionId and values answerId
 * */
export type UserLivestreamGroupQuestionAnswers = Record<
   Group["id"],
   UserGroupQuestionsWithAnswerMap
>

export interface RegisteredStudent extends UserData {
   dateRegistered: Timestamp
   livestreamId: LivestreamEvent["id"]
}

export interface ParticipatingStudent extends UserData {
   joined: Timestamp
   livestreamId: LivestreamEvent["id"]
}

export interface TalentPoolStudent extends UserData {
   dateJoinedTalentPool: Timestamp
   livestreamId: LivestreamEvent["id"]
}

export interface UserPublicData {
   id: string
   authId: string
   firstName: string
   lastName: string
   badges?: string[]
}

export type RegistrationStep = {
   userId: string
   steps: string[]
   totalSteps: number
   updatedAt: Timestamp
}

export type UserDataAnalytics = {
   registrationSteps: RegistrationStep
} & Identifiable

/**
 * userData/{id}/jobApplications/{doc}
 */
export interface UserJobApplicationDocument extends Identifiable {
   groupId: string
   integrationId: string
   jobId: string
   date: Timestamp
   updatedAt: Timestamp
   job: Job // will be serialized to plain object
   livestream: LivestreamEventPublicData
   rejectedAt?: Timestamp
   currentStage?: string
   rejectReason?: string
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
      authId: userData.authId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      badges: userData.badges || [],
   }
}

export const getLivestreamGroupQuestionAnswers = (
   livestreamGroupQuestionsWithUserAnswers: LivestreamGroupQuestionsMap
): UserLivestreamGroupQuestionAnswers => {
   return Object.values(
      livestreamGroupQuestionsWithUserAnswers
   ).reduce<UserLivestreamGroupQuestionAnswers>(
      (acc, groupDataWithQuestions) => {
         acc[groupDataWithQuestions.groupId] = Object.values(
            groupDataWithQuestions.questions
         ).reduce((acc, question) => {
            acc[question.id] = question.selectedOptionId
            return acc
         }, {})
         return acc
      },
      {}
   )
}

/**
 * Confirm if the user has already applied for a id in the
 * saved relations
 *
 * @param relations
 * @param jobId
 */
export const userAlreadyAppliedForJob = (
   relations: UserATSDocument,
   jobId: string
) => {
   for (let relation of Object.values(relations?.atsRelations)) {
      if (relation?.jobApplications?.[jobId]) {
         return true
      }
   }

   return false
}

// User Admin Groups
// Path: /userData/{userId}/userAdminGroups/{groupId}
export interface UserAdminGroup extends PublicGroup {
   userId: string
}

/*<------------------------>*/

// Auth User custom claims
export interface AuthUserCustomClaims {
   adminGroups?: AdminGroupsClaim
}

/*
 * Admin Groups Claim is a map of groupIds to the role of the user in that group
 * */
export type AdminGroupsClaim = Record<
   string,
   {
      role: GROUP_DASHBOARD_ROLE
   }
>

export type IUserReminder = {
   complete: boolean
   notBeforeThan?: Date
   type: UserReminderType
   isFirstReminder?: boolean
}

export enum UserReminderType {
   NewsletterReminder = "NewsletterReminder",
}

/*
 * the document id should be the group id
 * Path: /userData/{userId}/companiesUserFollows/{groupId}
 * */
export interface CompanyFollowed extends Identifiable {
   createdAt: Timestamp

   groupId: string
   group: PublicGroup

   userId: string
   user: UserPublicData
}

/**
 * User Activity document
 * Used for analytics purposes
 *
 * Path /userData/{userId}/activities/{generatedId}
 */
export interface UserActivity extends Identifiable {
   /**
    * When doing collection group queries, we can filter by documents
    * with this field to ignore other collections with the same name
    */
   collection: "userActivity"
   userId: string
   user: UserPublicData
   date: Timestamp

   /**
    * Can be populated if the activity type is related to a
    * livestream
    */
   relatedLivestreamId?: string

   /**
    * No real use atm for this field
    */
   type:
      | "tokenRefresh" // every hour firebase auth should refresh the token
      | "createdAt"
      | "livestreamRegistration"
      | "livestreamParticipation"
      | "livestreamRecordingView"
}
