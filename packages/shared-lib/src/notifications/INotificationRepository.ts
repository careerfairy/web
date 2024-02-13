import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../BaseFirebaseRepository"
import { EmailNotificationType, EmailNotification } from "./notifications"
import firebase from "firebase/compat/app"

export interface INotificationRepository {
   /**
    * Fetches all Notification related to the user email
    * @returns {Promise<EmailNotification[] | []>} A promise that resolves to an array of Notifications or an empty array
    */
   getUserReceivedNotifications(
      email: string,
      type?: EmailNotificationType
   ): Promise<EmailNotification[] | []>
}

export class NotificationFunctionsRepository
   extends BaseFirebaseRepository
   implements INotificationRepository
{
   constructor(readonly firestore: firebase.firestore.Firestore) {
      super()
   }
   async getUserReceivedNotifications(
      email: string,
      type?: EmailNotificationType
   ) {
      let query = this.firestore
         .collection("notifications")
         .where("details.receiver", "==", email)

      if (type) {
         query = query.where("details.type", "==", type)
      }
      const result = await query
         .withConverter(createCompatGenericConverter<EmailNotification>())
         .get()

      return result.docs.map((doc) => doc.data())
   }

   async createDiscoveryNotifications(
      emails: string[],
      type?: EmailNotificationType
   ) {
      const userToNotificationDetails = (userEmail: string) => {
         return {
            requester: "anonymous",
            receiver: userEmail,
            // draftId: streamId,
            type: type,
         }
      }

      await Promise.all(
         emails
            .map(userToNotificationDetails)
            .map((detail) => this.createNotification(detail, { force: true }))
      )
   }

   createNotification = async (details, options = { force: false }) => {
      const prevNotification = await this.checkForNotification(details)
      if (!prevNotification.empty && options.force === true) {
         throw `Notification Already Exists as document ${
            prevNotification.docs.at(0).id
         }`
      }

      const ref = this.firestore.collection("notifications")
      const newNotification = {
         details: details,
         open: true,
         created: this.getServerTimestamp(),
      }
      return ref.add(newNotification)
   }

   checkForNotification = (
      detailFieldsToCheck = { property1: "value1", property2: "property2" }
   ) => {
      const query = this.firestore
         .collection("notifications")
         .where("details", "==", detailFieldsToCheck)
         .limit(1)

      return query.get()
   }

   getServerTimestamp = () => {
      return firebase.firestore.FieldValue.serverTimestamp()
   }
}
