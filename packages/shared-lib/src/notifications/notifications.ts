import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"

export type EmailNotificationType =
   | "companyDiscovery"
   | "sparksDiscovery"
   | "livestream1stRegistrationDiscovery"
   | "recordingDiscovery"
   | "feedbackDiscovery"

export type EmailNotificationDetails = {
   userEmail: string
   sentBy: string
   type: EmailNotificationType
}

export type EmailNotification = {
   createdAt: Timestamp
   details: EmailNotificationDetails
} & Identifiable
