import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { ManualTemplatedEmailBuilder } from "./ManualTemplatedEmailBuilder"
import { IUserFunctionsRepository } from "./UserFunctionsRepository"

const AUDIENCE = ["CH", "DE"]

/**
 * Gathers all the required data to build the release email
 */
export class ManualTemplatedEmailService {
   /**
    * The users that have subscribed to the release email
    */
   // Leaving this commented as the most common usage will be with the full UserData
   // private subscribedUsers: Record<string, UserData>
   private subscribedUsers: Record<string, { id: string; firstName: string }>

   constructor(
      private readonly userRepo: IUserFunctionsRepository,
      private readonly emailBuilder: ManualTemplatedEmailBuilder,
      private readonly logger: Logger
   ) {}

   /**
    * Fetches the required data for generating the email
    */
   async fetchRequiredData(overrideUsers: string[]) {
      const users = await this.userRepo.getSubscribedUsersLastActiveAfter(
         new Date("2023-01-01"),
         overrideUsers
      )

      const audience = users?.filter((user) =>
         AUDIENCE.includes(user.universityCountryCode)
      )

      this.subscribedUsers = convertDocArrayToDict(audience)

      this.logger.info(
         "Total Users for levels teaser - ",
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
