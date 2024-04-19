import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { IUserFunctionsRepository } from "./UserFunctionsRepository"
import { ManualTemplatedEmailBuilder } from "./ManualTemplatedEmailBuilder"
import { ILivestreamFunctionsRepository } from "./LivestreamFunctionsRepository"

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
      private readonly livestreamRepo: ILivestreamFunctionsRepository,
      private readonly emailBuilder: ManualTemplatedEmailBuilder,
      private readonly logger: Logger
   ) {}

   /**
    * Fetches the required data for generating the email
    */
   async fetchRequiredData(overrideUsers: string[]) {
      // start fetching

      const fetchedUsers = await this.userRepo.getSubscribedUsers(overrideUsers)
      const subscribedUsers: UserData[] = fetchedUsers ? fetchedUsers : []

      // AAB Livestream
      const livestreams = await this.livestreamRepo.getLivestreamsByIds([
         "WWV4LsLI1Ec0dQjiiUyn",
      ])

      if (!livestreams || !livestreams.length) {
         this.logger.error("Could not retrieve AAB livestream by ID")
         return this
      }

      const aabLivestream = livestreams.at(0)

      // Filter: User is in ABB talent pool AND
      const filteredRegisteredUsers = subscribedUsers.filter((user) => {
         const isUserRegistered = aabLivestream.registeredUsers.includes(
            user.id
         )
         const isUserInTalentPool = aabLivestream.talentPool?.includes(user.id)
         return !isUserRegistered && isUserInTalentPool
      })

      this.subscribedUsers = convertDocArrayToDict(
         filteredRegisteredUsers as UserData[]
      )

      this.logger.info(
         "Total Users subscribed to the release email for AAB Talent Pool communication",
         this.subscribedUsers
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
         const name = this.subscribedUsers[userEmail]?.firstName ?? ""

         this.emailBuilder.addRecipient(userEmail, name)
      }

      return this.emailBuilder.send()
   }
}
