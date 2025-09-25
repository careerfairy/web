import BaseFirebaseRepository from "../BaseFirebaseRepository"
import firebase from "firebase/compat/app"
import {
   FieldOfStudy,
   MarketingUserCreationFields,
   MarketingUserDocument,
} from "./MarketingUser"

export interface IMarketingUsersRepository {
   create(data: MarketingUserCreationFields): Promise<void>
   delete(id: string): Promise<void>
}

export class FirebaseMarketingUsersRepository
   extends BaseFirebaseRepository
   implements IMarketingUsersRepository
{
   constructor(
      private readonly firestore: firebase.firestore.Firestore,
      private readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super()
   }

   // should be called from the backend only, .create is not available on the frontend sdk
   async create(data: MarketingUserCreationFields): Promise<void> {
      const fieldOfStudySnap = await this.firestore
         .collection("fieldsOfStudy")
         .doc(data.fieldOfStudyId)
         .get()

      const fieldOfStudy = fieldOfStudySnap.exists
         ? this.addIdToDoc<FieldOfStudy>(fieldOfStudySnap)
         : null
      delete data.fieldOfStudyId
      const toInsert: MarketingUserDocument = {
         ...data,
         fieldOfStudy,
         id: data.email,
         // @ts-ignore
         createdAt: this.fieldValue.serverTimestamp(),
      }

      return (
         this.firestore
            .collection("marketingUsers")
            .doc(data.email)
            // @ts-ignore
            .create(toInsert)
      )
   }

   delete(id: string): Promise<void> {
      return this.firestore.collection("marketingUsers").doc(id).delete()
   }
}
