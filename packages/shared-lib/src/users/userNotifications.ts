import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat"

export interface UserNotification extends Identifiable {
   documentType: "userNotification" // simplify groupCollection Queries

   createdAt: firebase.firestore.Timestamp
   message: string
   actionUrl: string

   readAt?: firebase.firestore.Timestamp
   companyId?: string
   livestreamId?: string
   sparkId?: string
   imageUrl?: string
   imageFormat?: "circular" | "contain"
}
