import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CompanyFollowed, UserData } from "@careerfairy/shared-lib/users"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/users/UserRepository"
import { isWithinNormalizationLimit } from "@careerfairy/shared-lib/utils"
import { DateTime } from "luxon"

const SUBSCRIBED_BEFORE_MONTHS_COUNT = 18

export interface IUserFunctionsRepository extends IUserRepository {
   getSubscribedUsers(userEmails?: string[]): Promise<UserData[]>

   /**
    * Retrieves the subscribed users, which were created earlier than a given number of days.
    * Differs also from @method getSubscribedUsers on the where clause, using @field createdAt instead of @field lastActivityAt for
    * date comparison.
    * @param userEmails Optional list of emails to filter results by
    * @param earlierThanDays Number of days to compare with creation date (creationDate >= today - earlierThanDays)
    */
   getSubscribedUsersEarlierThan(
      userEmails?: string[],
      earlierThanDays?: number
   ): Promise<UserData[]>
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
         const withinLimit = isWithinNormalizationLimit(30, userEmails)
         if (withinLimit) {
            query = query.where("userEmail", "in", userEmails)
         }
      }

      const data = await query.get()

      return mapFirestoreDocuments(data)
   }

   async getSubscribedUsersEarlierThan(
      userEmails?: string[],
      earlierThanDays?: number
   ): Promise<UserData[]> {
      const minusDays = earlierThanDays || SUBSCRIBED_BEFORE_MONTHS_COUNT * 31 // Convert months to days
      const earlierThan = DateTime.now().minus({ days: minusDays }).toJSDate()

      let query = this.firestore
         .collection("userData")
         .where("unsubscribed", "==", false)
         .where("createdAt", ">=", earlierThan)

      if (userEmails?.length) {
         const withinLimit = isWithinNormalizationLimit(30, userEmails)
         if (withinLimit) {
            query = query.where("userEmail", "in", userEmails)
         }
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
