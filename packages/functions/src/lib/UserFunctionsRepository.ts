import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/users/UserRepository"
import { DateTime } from "luxon"

export interface IUserFunctionsRepository extends IUserRepository {
   getSubscribedUsers(): Promise<UserData[]>
}

export class UserFunctionsRepository
   extends FirebaseUserRepository
   implements IUserFunctionsRepository
{
   async getSubscribedUsers(): Promise<UserData[]> {
      const earlierThan = DateTime.now().minus({ months: 18 }).toJSDate()

      const data = await this.firestore
         .collection("userData")
         .where("unsubscribed", "==", false)
         .where("lastActivityAt", ">=", earlierThan)
         .get()

      return mapFirestoreDocuments(data)
   }
}
