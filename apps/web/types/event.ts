import { Identifiable } from "./commonTypes"
import firebase from "firebase/app"

export interface LiveStreamEvent extends Identifiable {
   // required
   start: firebase.firestore.Timestamp

   // optional
   author?: {
      email: string
      groupId: string
   }
   summary?: string
   backgroundImageUrl?: string
   company?: string
   companyId?: string
   companyLogoUrl?: string
   created?: string
   currentSpeakerId?: string
   duration?: number
   groupIds?: string[]
   interestsIds?: string[]
   isRecording?: boolean
   language?: {
      code?: string
      name?: string
   }
   talentPool?: string[]
   test?: boolean
   title?: string
   type?: string
   startDate?: Date
   registeredUsers?: string[]
   hasStarted?: boolean
   hasEnded?: boolean
   targetCategories?: string[]
}
