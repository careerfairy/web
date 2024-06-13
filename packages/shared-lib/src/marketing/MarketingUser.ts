import firebase from "firebase/compat/app"
import { Identifiable, UTMParams } from "../commonTypes"

/**
 * Firestore document
 * /marketingUsers/{email}
 */
export interface MarketingUserDocument
   extends Identifiable,
      Omit<MarketingUserCreationFields, "fieldOfStudyId"> {
   fieldOfStudy: FieldOfStudy
   createdAt: firebase.firestore.Timestamp
}

/**
 * Properties that come from user input
 * Required & Optional
 */
export interface MarketingUserCreationFields {
   firstName: string
   lastName: string
   email: string
   fieldOfStudyId: string
   utmParams?: UTMParams
}

export type FieldOfStudy = {
   id: string
   name: string
}
