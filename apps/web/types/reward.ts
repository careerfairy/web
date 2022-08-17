import { Identifiable } from "./commonTypes"
import firebase from "firebase/compat/app"

export interface Reward extends Identifiable {
   action: string
   createdAt: firebase.firestore.Timestamp
   livestreamId?: string
   userId?: string
   points: number
   seenByUser: boolean
   livestreamData: any
   userData: any
}
