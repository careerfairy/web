import BaseFirebaseRepository from "../BaseFirebaseRepository"
import firebase from "firebase/compat/app"
import {
   MarketingUserCreationFields,
   MarketingUserDocument,
} from "./MarketingUser"

export interface IMarketingUsersRepository {
   create(data: MarketingUserCreationFields): Promise<void>
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
   create(data: MarketingUserCreationFields): Promise<void> {
      const toInsert: MarketingUserDocument = {
         ...data,
         id: data.email,
         // @ts-ignore
         createdAt: this.fieldValue.serverTimestamp(),
      }

      console.log("Creating", toInsert)

      return (
         this.firestore
            .collection("marketingUsers")
            .doc(data.email)
            // @ts-ignore
            .create(toInsert)
      )
   }
}
