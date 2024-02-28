import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CompanyFollowed, UserData } from "@careerfairy/shared-lib/users"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/users/UserRepository"
import { DateTime } from "luxon"

const SUBSCRIBED_BEFORE_MONTHS_COUNT = 18

export interface IUserFunctionsRepository extends IUserRepository {
   getSubscribedUsers(userEmails?: string[]): Promise<UserData[]>
   getGroupFollowers(groupId: string): Promise<CompanyFollowed[]>
}

export class UserFunctionsRepository
   extends FirebaseUserRepository
   implements IUserFunctionsRepository
{
   async getSubscribedUsers(userEmails?: string[]): Promise<UserData[]> {
      const earlierThan = DateTime.now()
         .minus({ months: SUBSCRIBED_BEFORE_MONTHS_COUNT })
         .toJSDate()

      let query = this.firestore
         .collection("userData")
         .where("unsubscribed", "==", false)
         .where("lastActivityAt", ">=", earlierThan)

      if (userEmails?.length) {
         query = query.where("userEmail", "in", userEmails)
      }

      const data = await query.get()

      return mapFirestoreDocuments(data)
   }

   async getGroupFollowers(groupId: string): Promise<CompanyFollowed[]> {
      const querySnapshot = await this.firestore
         .collectionGroup("companiesUserFollows")
         .where("id", "==", groupId)
         .get()

      return querySnapshot.docs?.map((doc) => doc.data() as CompanyFollowed)
   }
}
