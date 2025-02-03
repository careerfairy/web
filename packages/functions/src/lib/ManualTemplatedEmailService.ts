import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { ManualTemplatedEmailBuilder } from "./ManualTemplatedEmailBuilder"
import { IUserFunctionsRepository } from "./UserFunctionsRepository"

const AUDIENCE = ["CH", "DE"]
const EXCLUDED_USER_EMAILS = [
   "imke00@web.de",
   "tinika+eva@gmail.com",
   "lucilechapuis73@gmail.com",
   "zhoutianjing519@gmail.com",
   "fabiennenina.hess@bluewin.ch",
   "lucas@careerfairy.io",
   "jose.monterrosasro@udlap.mx",
   "stanley.wong26@yahoo.de",
   "jfjoel.fischer@gmail.com",
   "tanvi.chinnapa@rwth-aachen.de",
   "j.senz@gmx.net",
   "gautamj97@gmail.com",
   "bossujung@outlook.com",
   "vicki.windpassinger@icloud.com",
   "kaayushie@gmail.com",
   "senoussimht05@gmail.com",
   "agnes.wiecek@gmail.com",
   "msidimamachabi@yahoo.fr",
   "tywoniukmagdalena@gmail.com",
   "motouri@gmail.com",
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

      const audience = users.filter(
         (user) =>
            AUDIENCE.includes(user.universityCountryCode) &&
            !EXCLUDED_USER_EMAILS.includes(user.userEmail)
      )

      this.subscribedUsers = convertDocArrayToDict(audience)

      this.logger.info(
         "Total Users for levels launch - ",
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
