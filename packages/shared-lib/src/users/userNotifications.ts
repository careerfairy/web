import firebase from "firebase/compat/app"
import { Identifiable } from "../commonTypes"

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
   buttonText?: string
}
