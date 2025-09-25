import firebase from "firebase/compat/app"
import BaseFirebaseRepository, {
   createCompatGenericConverter,
} from "../../BaseFirebaseRepository"
import { UserSparksNotification } from "../../users"
import { IPublicSparksNotificationsRepository } from "./IPublicSparksNotificationsRepository"

export default class PublicSparksNotificationsRepository
   extends BaseFirebaseRepository
   implements IPublicSparksNotificationsRepository
{
   private readonly COLLECTION_NAME: string = "publicSparksNotifications"

   constructor(readonly firestore: firebase.firestore.Firestore) {
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
      // The notification id is the group id. This is to ensure there is only one notification per group.
      return void this.firestore
         .collection(this.COLLECTION_NAME)
         .doc(notification.id)
         .set(notification)
   }

   async delete(id: string): Promise<void> {
      return this.firestore.collection(this.COLLECTION_NAME).doc(id).delete()
   }

   async update(notification: UserSparksNotification): Promise<void> {
      return void this.firestore
         .collection(this.COLLECTION_NAME)
         .doc(notification.id)
         .update(notification)
   }
}
