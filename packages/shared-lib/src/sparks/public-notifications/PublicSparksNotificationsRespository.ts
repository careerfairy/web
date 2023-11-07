import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../../BaseFirebaseRepository"
import { UserSparksNotification } from "../../users"
import { IPublicSparksNotificationsRepository } from "./IPublicSparksNotificationsRepository"
import { Create } from "../../commonTypes"

export class PublicNotificationsRespository
   extends BaseFirebaseRepository
   implements IPublicSparksNotificationsRepository
{
   constructor(
      private readonly COLLECTION_NAME: string = "publicSparksNotification",
      readonly firestore: firebase.firestore.Firestore,
      readonly fieldValue: typeof firebase.firestore.FieldValue,
      readonly timestamp: typeof firebase.firestore.Timestamp
   ) {
      super()
   }

   async getAll(): Promise<[] | UserSparksNotification[]> {
      const result = await this.firestore
         .collection(this.COLLECTION_NAME)
         .withConverter(createCompatGenericConverter<UserSparksNotification>())
         .get()

      return result.docs.map((doc) => doc.data())
   }

   async create(notification: UserSparksNotification): Promise<void> {
      const doc: Create<UserSparksNotification> = {
         eventId: notification.eventId,
         startDate: notification.startDate,
         groupId: notification.groupId,
      }

      return void this.firestore.collection(this.COLLECTION_NAME).add(doc)
   }

   async delete(id: string): Promise<void> {
      return this.firestore.collection(this.COLLECTION_NAME).doc(id).delete()
   }

   async update(notification: UserSparksNotification): Promise<void> {
      await this.delete(notification.id)
      return this.create(notification)
   }
}
