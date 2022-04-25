import { Identifiable } from "../commonTypes"
import firebase from "firebase"

export interface LivestreamEvent extends Identifiable {
   author?: {
      email: string
      groupId: string
   }
   summary?: string
   backgroundImageUrl?: string
   company?: string
   companyId?: string
   companyLogoUrl?: string
   created?: firebase.firestore.Timestamp
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
}

export interface Speaker extends Identifiable {
   avatar?: string
   background?: string
   firstName?: string
   lastName?: string
   position?: string
   rank?: number
}
