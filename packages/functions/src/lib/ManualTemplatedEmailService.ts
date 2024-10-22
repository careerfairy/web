import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { ILivestreamFunctionsRepository } from "./LivestreamFunctionsRepository"
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      private readonly userRepo: IUserFunctionsRepository,
      private readonly livestreamRepo: ILivestreamFunctionsRepository,
      private readonly emailBuilder: ManualTemplatedEmailBuilder,
      private readonly logger: Logger
   ) {}

   /**
    * Fetches the required data for generating the email
    */
   async fetchRequiredData(overrideUsers: string[]) {
      let users = []
      if (overrideUsers?.length) {
         users = await this.userRepo.getSubscribedUsers(overrideUsers)
      } else {
         // start fetching users who participated in event: Jkb23QaWsbNC1pQWgLpG - VZ Consultants en direct: Votre clé pour la réussite financière
         const userLivestreamData =
            await this.livestreamRepo.getLivestreamUsers(
               "Jkb23QaWsbNC1pQWgLpG",
               "registered"
            )
         users = (userLivestreamData || []).map((data) => data.user)
      }

      this.subscribedUsers = convertDocArrayToDict(users)

      this.logger.info(
         "Total Users registered to event Jkb23QaWsbNC1pQWgLpG - ",
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
