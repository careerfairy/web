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
    * Fetches all Notifications related to the user email
    * @returns {Promise<EmailNotification[] | []>} A promise that resolves to an array of Notifications or an empty array
    */
   getUserReceivedNotifications(
      email: string,
      type?: EmailNotificationType
   ): Promise<EmailNotification[]>

   /**
    * Creates email notifications for the user emails and the given type. A check is made before creating, for the type and user.
    * @param emails User emails to create notifications for
    * @param type Type of email notification
    */
   createNotificationDocs(
      emails: string[],
      type?: EmailNotificationType
   ): Promise<DocumentData[]>

   getServerTimestamp(): FieldValue
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

   async createNotificationDocs(
      emails: string[],
      type?: EmailNotificationType
   ): Promise<DocumentData[]> {
      const userToNotificationDetails = (
         userEmail: string
      ): EmailNotificationDetails => {
         return {
            sentBy: "careerfairy.io",
            receiverEmail: userEmail,
            type: type,
         }
      }

      return await Promise.all(
         emails.map(userToNotificationDetails).map(this.createNotificationDoc)
      )
   }

   createNotificationDoc = async (details: EmailNotificationDetails) => {
      const ref = this.firestore.collection("emailNotifications")
      const newNotification = {
         details: details,
         createdAt: this.getServerTimestamp(),
      } as EmailNotification

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
