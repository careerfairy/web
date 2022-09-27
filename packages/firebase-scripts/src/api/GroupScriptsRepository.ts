import {
   GroupFunctionsRepository,
   IGroupFunctionsRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupFunctionsRepository"
import firebase from "firebase/compat"
import admin = require("firebase-admin")
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

export interface IGroupScriptsRepository extends IGroupFunctionsRepository {
   getAllAdmins(withRef?: boolean): Promise<any[]>
   getAllAuthUsers(): Promise<admin.auth.UserRecord[]>
}

export class GroupScriptsRepository
   extends GroupFunctionsRepository
   implements IGroupScriptsRepository
{
   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue,
      protected readonly auth: admin.auth.Auth
   ) {
      super(firestore, fieldValue, auth)
   }

   async getAllAdmins(withRef?: boolean): Promise<any[]> {
      const admins = await this.firestore.collectionGroup("admins").get()
      return mapFirestoreDocuments(admins, withRef)
   }

   async getAllAuthUsers(): Promise<admin.auth.UserRecord[]> {
      const users = await this.auth.listUsers()
      return users.users
   }
}
