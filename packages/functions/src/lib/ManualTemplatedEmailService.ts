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
    * Fetches the required data for generating the email.
    */
   async fetchRequiredData(overrideUsers: string[]) {
      // start fetching

      const fetchedUsers = await this.userRepo.getAllSubscribedUsers(
         overrideUsers
      )

      const subscribedUsers: UserData[] = fetchedUsers ? fetchedUsers : []

      const filteredUsers = subscribedUsers.filter((user) => {
         return (
            user?.universityCountryCode == "DE" ||
            user?.spokenLanguages?.includes("de")
         )
      })

      this.subscribedUsers = convertDocArrayToDict(filteredUsers as UserData[])

      this.logger.info(
         "Total German student and German speaking Users subscribed to the resolution email",
         Object.keys(this.subscribedUsers).length
      )

      return this
   }

   /**
    * Sends the email
    *
    * Possibility of overriding the users to send the release email to
    * for testing purposes
    */
   send() {
      const emails = Object.keys(this.subscribedUsers)

      for (const userEmail of emails) {
         const name = this.subscribedUsers[userEmail]?.firstName ?? ""

         this.emailBuilder.addRecipient(userEmail, name)
      }

      return this.emailBuilder.send()
   }
}
