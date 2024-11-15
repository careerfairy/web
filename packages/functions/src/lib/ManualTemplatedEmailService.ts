import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { processInBatches } from "../util"
import { ManualTemplatedEmailBuilder } from "./ManualTemplatedEmailBuilder"
import { IUserFunctionsRepository } from "./UserFunctionsRepository"
import { ISparkFunctionsRepository } from "./sparks/SparkFunctionsRepository"

const USERS_WHO_CLICKED_ON_SET = [
   "suhuisn312@gmail.com",
   "ujji0074u@gmail.com",
   "nyembarumbidzai1@gmail.com",
   "tiisanolekganyane@gmail.com",
   "xetoja8586@losvtn.com",
   "hermelan.kouaho@hec.edu",
] // List of users who have already clicked on previous email for 'Simple email template'

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
      private readonly sparksRepo: ISparkFunctionsRepository,
      private readonly emailBuilder: ManualTemplatedEmailBuilder,
      private readonly logger: Logger
   ) {}

   /**
    * Fetches the required data for generating the email
    */
   async fetchRequiredData(overrideUsers: string[]) {
      const BATCH_SIZE = 500

      let users = (
         await this.userRepo.getSubscribedUsers(overrideUsers, undefined, 6)
      )
         .filter((user) => {
            return !USERS_WHO_CLICKED_ON_SET.includes(user.id)
         })
         .map((user) => {
            return {
               id: user.id,
               firstName: user.firstName,
            }
         })

      const userStatsData: Record<
         string,
         { numberOfParticipatedEvents: number; numberOfSparksSeen: number }
      > = {}

      const getUserStats = async (userId: string) => {
         const numberOfParticipatedEvents =
            (await this.userRepo.getUserStats(userId))
               ?.totalLivestreamAttendances || 0
         const numberOfSparksSeen =
            (
               await this.sparksRepo.getUserSparkInteraction(
                  userId,
                  "seenSparks"
               )
            )?.length || 0
         userStatsData[userId] = {
            numberOfParticipatedEvents,
            numberOfSparksSeen,
         }
      }

      await processInBatches(
         users.map((user) => user.id),
         BATCH_SIZE,
         getUserStats,
         this.logger
      )

      users = users
         .sort((baseUser, compUser) => {
            if (
               userStatsData[baseUser.id].numberOfSparksSeen !=
               userStatsData[compUser.id].numberOfSparksSeen
            )
               return (
                  userStatsData[baseUser.id].numberOfSparksSeen -
                  userStatsData[compUser.id].numberOfSparksSeen
               )

            return (
               userStatsData[baseUser.id].numberOfParticipatedEvents -
               userStatsData[compUser.id].numberOfParticipatedEvents
            )
         })
         .slice(0, 1500)

      this.subscribedUsers = convertDocArrayToDict(users)

      this.logger.info(
         "Total Users registered for fill and win - ",
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
