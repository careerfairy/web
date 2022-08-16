import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat"
import Timestamp = firebase.firestore.Timestamp

export const NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST =
   1000 * 60 * 60 * 12

export interface LivestreamEvent extends Identifiable {
   author?: {
      email: string
      groupId?: string
   }
   summary?: string
   backgroundImageUrl?: string
   company?: string
   companyId?: string
   participants?: string[]
   participatingStudents?: string[]
   companyLogoUrl?: string
   created?: Timestamp
   currentSpeakerId?: string
   duration?: number
   groupIds?: string[]
   interestsIds?: string[]
   isRecording?: boolean
   language?: {
      code?: string
      name?: string
   }
   hidden?: boolean
   talentPool?: string[]
   test?: boolean
   title?: string
   type?: string
   start: firebase.firestore.Timestamp
   startDate?: Date
   status?: LivestreamStatus
   registeredUsers?: string[]
   registrants?: string[]
   hasStarted?: boolean
   hasEnded?: boolean
   targetCategories?: string[]
   lastUpdated?: firebase.firestore.Timestamp
   speakers?: Speaker[]
   lastUpdatedAuthorInfo?: {
      email: string
      groupId: string
   }
   universities: any[]

   // ATS Jobs
   /**
    * During livestream creating, jobs can be associated with the livestream
    */
   jobs?: LivestreamJobAssociation[]
}

export interface LivestreamStatus {
   pendingApproval?: boolean
   seen?: boolean
}

export interface LivestreamJobAssociation {
   integrationId: string
   jobId: string
   name: string
}

export interface Speaker extends Identifiable {
   avatar?: string
   background?: string
   firstName?: string
   lastName?: string
   position?: string
   rank?: number
}

export interface LivestreamEventPublicData {
   summary?: string
   company?: string
   title?: string
   id: string
   start?: firebase.firestore.Timestamp
   companyLogoUrl?: string
   test?: boolean
}

export interface BreakoutRoom extends Identifiable {
   companyLogoUrl?: string
   test?: boolean
   title?: string
   start: firebase.firestore.Timestamp
   hasStarted?: boolean
   hasEnded?: boolean
   liveSpeakers?: Speaker[]
   index?: number
   parentLivestream?: LivestreamEventPublicData
}

/**
 * Public information about a livestream event
 *
 * Useful to save on relationship documents
 * @param livestreamData
 */
export const pickPublicDataFromLivestream = (
   livestreamData: LivestreamEvent
): LivestreamEventPublicData => {
   return {
      id: livestreamData.id,
      // we prefer null instead of undefined (firestore doesn't allow storing undefined values)
      summary: livestreamData.summary ?? null,
      company: livestreamData.company ?? null,
      title: livestreamData.title ?? null,
      start: livestreamData.start ?? null,
      companyLogoUrl: livestreamData.companyLogoUrl ?? null,
      test: livestreamData.test ?? false,
   }
}

export interface LivestreamEventSerialized
   extends Omit<
      LivestreamEvent,
      | "registeredUsers"
      | "registrants"
      | "talentPool"
      | "participatingStudents"
      | "participants"
      | "created"
      | "start"
      | "startDate"
      | "lastUpdated"
      | "lastUpdatedAuthorInfo"
   > {
   createdDateString: string
   startDateString: string
   lastUpdatedDateString: string
}

export interface LivestreamEventParsed extends LivestreamEventSerialized {
   startDate: Date
   createdDate: Date
   lastUpdatedDate: Date
}
