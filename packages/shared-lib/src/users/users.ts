import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat/app"
import { Group, GroupQuestion, GroupQuestionOption } from "../groups"
import { LivestreamEvent, LivestreamGroupQuestionsMap } from "../livestreams"

export interface UserData extends Identifiable {
   authId: string
   firstName: string
   lastName: string
   fieldOfStudy?: {
      name: string
      id: string
   }
   levelOfStudy?: {
      name: string
      id: string
   }
   university: {
      groupId: string
      code: string
      name: string
      questions: UserReadableGroupQuestionsWithAnswerMap
   }
   badges?: string[]
   groupIds: string[]
   registeredGroups?: RegisteredGroup[]
   linkedinUrl: string
   isAdmin?: boolean
   userResume: string
   backFills: BackFillType[]
   universityCountryCode: string
   unsubscribed?: boolean
   userEmail: string
   talentPools?: string[]
   validationPin: number
   interestsIds?: string[]
   points?: number
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
}

/*
 * Key is the questionId and value is the answerId
 * */
export type UserGroupQuestionsWithAnswerMap = Record<
   GroupQuestion["id"],
   string
>
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
export interface UserGroupData extends Identifiable {
   userUid?: UserData["authId"]
   groupId: Group["id"]
   groupName: Group["universityName"]
   groupLogo: Group["logoUrl"]
   groupUniversityCode?: Group["universityCode"]
   questions?: UserGroupQuestionsWithAnswerMap
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
}

export interface SavedRecruiter extends Identifiable {
   livestreamId: string
   userId: string
   savedAt: firebase.firestore.Timestamp

   livestreamDetails: {
      title: string
      company: string
      start: firebase.firestore.Timestamp
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
   dateRegistered: firebase.firestore.Timestamp
   livestreamId: LivestreamEvent["id"]
}

export interface ParticipatingStudent extends UserData {
   joined: firebase.firestore.Timestamp
   livestreamId: LivestreamEvent["id"]
}

export interface TalentPoolStudent extends UserData {
   dateJoinedTalentPool: firebase.firestore.Timestamp
   livestreamId: LivestreamEvent["id"]
}

export interface UserPublicData {
   id: string
   firstName: string
   lastName: string
   badges?: string[]
}

export type RegistrationStep = {
   userId: string
   steps: string[]
   totalSteps: number
   updatedAt: firebase.firestore.Timestamp
}

export type UserDataAnalytics = {
   registrationSteps: RegistrationStep
} & Identifiable

/**
 * Public information about a user
 *
 * Useful to save on relationship documents
 * @param userData
 */
export const pickPublicDataFromUser = (userData: UserData): UserPublicData => {
   return {
      id: userData.id,
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
