import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import { Logger } from "@careerfairy/shared-lib/utils/types"
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
      // start fetching
      const users = await this.userRepo.getSubscribedUsers(overrideUsers)

      this.subscribedUsers = convertDocArrayToDict(users)

      this.logger.info(
         "Total Users subscribed to the release email for AAB Talent Pool communication",
         Object.keys(this.subscribedUsers).length
      )

      return this
   }

   /**
    * Sends the Spark Release Email to the subscribed users
    *
    * Possibility of overriding the users to send the release email to
    * for testing purposes
    */
   send() {
      const emails = Object.keys(this.subscribedUsers)

      for (const userEmail of emails) {
         this.emailBuilder.addRecipient(userEmail)
      }

      return this.emailBuilder.send()
   }
}
