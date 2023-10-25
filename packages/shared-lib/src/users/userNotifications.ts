import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat"

export interface UserNotification extends Identifiable {
   documentType: "userNotification" // simplify groupCollection Queries

   createdAt: firebase.firestore.Timestamp
   message: string
   isRead: boolean
   actionUrl: string

   companyName?: string
   imageUrl?: string
}

export type PublicUserNotification = Pick<
   UserNotification,
   | "id"
   | "createdAt"
   | "message"
   | "isRead"
   | "imageUrl"
   | "actionUrl"
   | "companyName"
>

export const pickPublicDataFromUserNotification = (
   notification: UserNotification
): PublicUserNotification => ({
   id: notification.id,
   createdAt: notification.createdAt ?? null,
   message: notification.message ?? null,
   isRead: notification.isRead ?? null,
   imageUrl: notification.imageUrl ?? null,
   actionUrl: notification.actionUrl ?? null,
   companyName: notification.companyName ?? null,
})
