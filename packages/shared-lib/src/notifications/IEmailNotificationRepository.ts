import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../BaseFirebaseRepository"
import { FieldValue } from "firebase-admin/firestore"
import {
   EmailNotificationType,
   EmailNotification,
   EmailNotificationDetails,
} from "./notifications"
import firebase from "firebase/compat/app"
import { DocumentData } from "firebase/firestore"

export interface IEmailNotificationRepository {
   /**
    * Fetches all Notification related to the user email
    * @returns {Promise<EmailNotification[] | []>} A promise that resolves to an array of Notifications or an empty array
    */
   getUserReceivedNotifications(
      email: string,
      type?: EmailNotificationType
   ): Promise<EmailNotification[]>

   getServerTimestamp(): FieldValue

   createDiscoveryNotifications(
      emails: string[],
      type?: EmailNotificationType
   ): Promise<DocumentData[]>
}

export class EmailNotificationFunctionsRepository
   extends BaseFirebaseRepository
   implements IEmailNotificationRepository
{
   constructor(readonly firestore: firebase.firestore.Firestore) {
      super()
   }

   async getUserReceivedNotifications(
      email: string,
      type?: EmailNotificationType
   ) {
      let query = this.firestore
         .collection("emailNotifications")
         .where("details.receiverEmail", "==", email)

      if (type) {
         query = query.where("details.type", "==", type)
      }
      const result = await query
         .withConverter(createCompatGenericConverter<EmailNotification>())
         .get()

      return result.docs.map((doc) => doc.data())
   }

   /**
    * Adds new entries to the emailNotification collection, for each user email, checking before hand
    * if there is already an email notification for the user and type
    * @param emails
    * @param type
    */
   async createDiscoveryNotifications(
      emails: string[],
      type?: EmailNotificationType
   ): Promise<DocumentData[]> {
      const userToNotificationDetails = (userEmail: string) => {
         return {
            sentBy: "careerfairy.io",
            receiverEmail: userEmail,
            type: type,
         } as EmailNotificationDetails
      }

      return await Promise.all(
         emails.map(userToNotificationDetails).map(this.createNotification)
      )
   }

   createNotification = async (details: EmailNotificationDetails) => {
      const prevNotification = await this.checkForNotificationByType(
         details.receiverEmail,
         details.type
      )
      if (!prevNotification.empty) {
         throw `Notification Already Exists as document ${
            prevNotification.docs.at(0).id
         }`
      }

      const ref = this.firestore.collection("emailNotifications")
      const newNotification = {
         details: details,
         createdAt: this.getServerTimestamp(),
      } as EmailNotification
      console.log(
         "🚀 ~ createNotification= ~ newNotification:",
         newNotification
      )

      return ref.add(newNotification)
   }

   checkForNotificationByType = (
      email: string,
      type: EmailNotificationType
   ) => {
      const query = this.firestore
         .collection("emailNotifications")
         .where("details.type", "==", type)
         .where("details.receiverEmail", "==", email)
         .limit(1)

      return query.get()
   }

   getServerTimestamp = () => {
      return FieldValue.serverTimestamp()
   }
}
