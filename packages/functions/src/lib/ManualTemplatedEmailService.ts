import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { ManualTemplatedEmailBuilder } from "./ManualTemplatedEmailBuilder"
import { IUserFunctionsRepository } from "./UserFunctionsRepository"

const EUROPEAN_COUNTRY_CODES = [
   "AT",
   "AD",
   "BE",
   "BG",
   "CH",
   "CZ",
   "DE",
   "DK",
   "EE",
   "ES",
   "FI",
   "FR",
   "GB",
   "GR",
   "HR",
   "HU",
   "IE",
   "IT",
   "LI",
   "LU",
   "MC",
   "MT",
   "NL",
   "NO",
   "PL",
   "PT",
   "RO",
   "RS",
   "SE",
   "SI",
   "SK",
   "SM",
]

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

      const europeanUsers = users?.filter(
         (user) =>
            !user.fcmTokens?.length &&
            EUROPEAN_COUNTRY_CODES.includes(user.universityCountryCode)
      )

      this.subscribedUsers = convertDocArrayToDict(europeanUsers)

      this.logger.info(
         "Total Users for app live announcement - ",
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
