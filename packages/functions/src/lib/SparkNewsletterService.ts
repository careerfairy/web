import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { IUserFunctionsRepository } from "./UserFunctionsRepository"
import { SparkReleaseEmailBuilder } from "./SparkReleaseEmailBuilder"

/**
 * Gathers all the required data to build the release email
 */
export class SparkReleaseEmailService {
   /**
    * The users that have subscribed to the release email
    */
   private subscribedUsers: Record<string, UserData>

   constructor(
      private readonly userRepo: IUserFunctionsRepository,
      private readonly emailBuilder: SparkReleaseEmailBuilder,
      private readonly logger: Logger
   ) {}

   /**
    * Fetches the required data for generating the release email
    */
   async fetchRequiredData() {
      // start fetching in parallel

      const subscribedUsers = await this.userRepo.getSubscribedUsers()

      this.subscribedUsers = convertDocArrayToDict(
         subscribedUsers as UserData[]
      )

      this.logger.info(
         "Total Users subscribed to the release email",
         subscribedUsers.length
      )

      return this
   }

   /**
    * Sends the Spark Release Email to the subscribed users
    *
    * Possibility of overriding the users to send the release email to
    * for testing purposes
    */
   send(overrideUsers?: string[]) {
      const emails = overrideUsers ?? Object.keys(this.subscribedUsers)

      for (const userEmail of emails) {
         const name = this.subscribedUsers[userEmail]?.firstName ?? ""

         this.emailBuilder.addRecipient(userEmail, name)
      }

      return this.emailBuilder.send()
   }
}
