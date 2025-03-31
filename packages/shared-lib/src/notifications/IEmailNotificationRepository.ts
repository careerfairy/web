import { FieldValue } from "firebase-admin/firestore"
import firebase from "firebase/compat/app"
import { DocumentData } from "firebase/firestore"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../BaseFirebaseRepository"
import { chunkArray } from "../utils"
import {
   EmailNotification,
   EmailNotificationDetails,
   EmailNotificationType,
} from "./notifications"

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

   /**
    * Creates email notifications for the received details.
    * @param details EmailNotificationDetails ready to stored
    */
   createNotificationDocuments(
      details: EmailNotificationDetails[]
   ): Promise<DocumentData[]>

   createNotificationsBatched(
      details: EmailNotificationDetails[]
   ): Promise<EmailNotification[]>

   /**
    * Retrieves all emailNotifications for the given @param type
    * @param type Type of emailNotification to retrieved, matched against /emailNotification/details.type
    */
   getNotifications(type: EmailNotificationType): Promise<EmailNotification[]>
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

   async getNotifications(type: EmailNotificationType) {
      const query = this.firestore
         .collection("emailNotifications")
         .where("details.type", "==", type)
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

   async createNotificationDocuments(
      details: EmailNotificationDetails[]
   ): Promise<DocumentData[]> {
      return await Promise.all(details.map(this.createNotificationDoc))
   }

   async createNotificationsBatched(
      details: EmailNotificationDetails[]
   ): Promise<EmailNotification[]> {
      const createdNotifications = []

      const chunks = 499

      const splitChunks = chunkArray(details, chunks)

      const batchPromises = splitChunks.map((detailsChunk) => {
         const batch = this.firestore.batch()

         detailsChunk.forEach((detail) => {
            const ref = this.firestore.collection("emailNotifications").doc()
            const newNotification: EmailNotification = {
               details: detail,
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               createdAt: this.getServerTimestamp() as unknown as any,
               id: ref.id,
            }
            createdNotifications.push(newNotification)
            batch.set(ref, newNotification)
         })
         return batch.commit()
      })
      await Promise.all(batchPromises)
      return createdNotifications
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
