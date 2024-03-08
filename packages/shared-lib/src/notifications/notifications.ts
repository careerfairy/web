import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"

export type EmailNotificationType =
   | "companyDiscovery"
   | "sparksDiscovery"
   | "livestream1stRegistrationDiscovery"
   | "recordingDiscovery"
   | "feedbackDiscovery"
   | "endOfSparksTrial"

export type EmailNotificationDetails = {
   receiverEmail: string
   sentBy: string
   type: EmailNotificationType
   groupId?: string
}

export type EmailNotification = {
   createdAt: Timestamp
   details: EmailNotificationDetails
   templateId: string
} & Identifiable
