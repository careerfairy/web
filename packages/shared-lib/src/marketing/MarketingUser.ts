import { Identifiable, UTMParams } from "../commonTypes"
import firebase from "firebase/compat"

/**
 * Firestore document
 * /marketingUsers/{email}
 */
export interface MarketingUserDocument
   extends Identifiable,
      MarketingUserCreationFields {
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
   fieldOfStudy: FieldOfStudy
   utmParams?: UTMParams
}

export type FieldOfStudy = {
   id: string
   name: string
}
