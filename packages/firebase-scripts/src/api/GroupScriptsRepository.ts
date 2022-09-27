import {
   GroupFunctionsRepository,
   IGroupFunctionsRepository,
} from "@careerfairy/functions/dist/lib/GroupFunctionsRepository"
import firebase from "firebase/compat"
import admin = require("firebase-admin")

export interface IGroupScriptsRepository extends IGroupFunctionsRepository {}

export class GroupScriptsRepository
   extends GroupFunctionsRepository
   implements IGroupScriptsRepository
{
   constructor(
      protected readonly firestore: firebase.firestore.Firestore,
      protected readonly fieldValue: typeof firebase.firestore.FieldValue,
      private readonly auth: admin.auth.Auth
   ) {
      super(firestore, fieldValue, auth)
   }
}
