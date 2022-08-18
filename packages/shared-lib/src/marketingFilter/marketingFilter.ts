import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat"

export interface MarketingFilter extends Identifiable {
   label: string // unique
   universityIds: string[]
   // OR
   universityCountryIds: string[]

   levelOfStudyIds: string[]
   fieldOfStudyIds: string[]
   // livestreamIds: string[]
   createdAt: firebase.firestore.Timestamp
   updatedAt: firebase.firestore.Timestamp
}
