import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { Timestamp } from "firebase-admin/firestore"
import { ManualTemplatedEmailBuilder } from "./ManualTemplatedEmailBuilder"
import { IUserFunctionsRepository } from "./UserFunctionsRepository"

/**
 * Gathers all the required data to build the release email
 */
export class ManualTemplatedEmailService {
   /**
    * The users that have subscribed to the release email
    */
   private subscribedUsers: Record<string, UserData>

   constructor(
      private readonly userRepo: IUserFunctionsRepository,
      // private readonly livestreamRepo: ILivestreamFunctionsRepository,
      private readonly emailBuilder: ManualTemplatedEmailBuilder,
      private readonly logger: Logger
   ) {}

   /**
    * Fetches the required data for generating the email
    */
   async fetchRequiredData(overrideUsers: string[]) {
      const dateFrom = new Date("2023-01-01")
      const lastActivityTimestamp = Timestamp.fromDate(dateFrom)

      // start fetching
      const swissSubscribedUsers =
         await this.userRepo.getSubscribedUsersByCountryCode(
            "CH",
            overrideUsers
         )

      const users = (swissSubscribedUsers || []).filter(
         (user) => user.lastActivityAt >= lastActivityTimestamp
      )

      this.subscribedUsers = convertDocArrayToDict(users)

      this.logger.info(
         "Total Users subscribed to the release email for B2C content tagging launch announcement",
         Object.keys(this.subscribedUsers || {}).length
      )

      return this
   }

   /**
    * Sends the Email to the subscribed users
    *
    * Possibility of overriding the users to send the release email to
    * for testing purposes.
    */
   send() {
      const emails = Object.keys(this.subscribedUsers || {})

      for (const userEmail of emails) {
         this.emailBuilder.addRecipient(
            userEmail,
            this.subscribedUsers[userEmail].firstName
         )
      }

      return this.emailBuilder.send()
   }
}
