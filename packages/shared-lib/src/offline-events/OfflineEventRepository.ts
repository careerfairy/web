import firebase from "firebase/compat/app"
import BaseFirebaseRepository from "../BaseFirebaseRepository"
import { Timestamp } from "../firebaseTypes"
import { AuthorInfo } from "../livestreams"
import { OfflineEvent } from "./offline-events"

export interface IOfflineEventRepository {
   createOfflineEvent(event: OfflineEvent, author: AuthorInfo): Promise<void>

   updateOfflineEvent(
      event: Partial<OfflineEvent>,
      author: AuthorInfo
   ): Promise<void>

   deleteOfflineEvent(eventId: string): Promise<void>
}

export class FirebaseOfflineEventRepository
   extends BaseFirebaseRepository
   implements IOfflineEventRepository
{
   protected readonly COLLECTION_NAME = "offlineEvents"

   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   async createOfflineEvent(event: OfflineEvent, author: AuthorInfo) {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc()
      const now = this.fieldValue.serverTimestamp() as Timestamp

      const newOfflineEvent: OfflineEvent = {
         ...event,
         author,
         lastUpdatedBy: author,
         id: ref.id,
         createdAt: now,
         updatedAt: now,
      }

      await ref.set(newOfflineEvent)
   }

   async updateOfflineEvent(event: Partial<OfflineEvent>, author: AuthorInfo) {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc(event.id)
      const now = this.fieldValue.serverTimestamp() as Timestamp

      const updatedOfflineEvent: Partial<OfflineEvent> = {
         ...event,
         lastUpdatedBy: author,
         updatedAt: now,
      }

      await ref.update(updatedOfflineEvent)
   }

   async deleteOfflineEvent(eventId: string) {
      const ref = this.firestore.collection(this.COLLECTION_NAME).doc(eventId)
      await ref.delete()
   }
}
