import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { IEmailNotificationRepository as IEmailFunctionsNotificationRepository } from "@careerfairy/shared-lib/notifications/IEmailNotificationRepository"
import {
   EmailNotification,
   EmailNotificationType,
} from "@careerfairy/shared-lib/notifications/notifications"
import { RegisteredLivestreams, UserData } from "@careerfairy/shared-lib/users"
import {
   getDateDifferenceInDays,
   sortLivestreamsDesc,
} from "@careerfairy/shared-lib/utils"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { processInBatches } from "../../../util" // Make sure to import the function
import { IGroupFunctionsRepository } from "../../GroupFunctionsRepository"
import { IUserFunctionsRepository } from "../../UserFunctionsRepository"
import UserEventRecommendationService from "../../recommendation/UserEventRecommendationService"
import { IRecommendationDataFetcher } from "../../recommendation/services/DataFetcherRecommendations"
import { NewsletterEmailBuilder } from "../NewsletterEmailBuilder"

const TOLERANCE_DAYS = 2
const LOCATION_FILTERS = [
   "AT",
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
 * Data structure used to associate each user with his recommended live streams
 * and groups he is following
 */
type UserLivestreams = {
   recommendedLivestreams: LivestreamEvent[]
   followingCompanies: {
      [groupId: string]: {
         livestreams: LivestreamEvent[]
         group: PublicGroup
      }
   }
}

/**
 * Gathers all the required data to build the newsletter
 */
export class NewsletterService {
   /**
    * The users that have subscribed to the newsletter
    */
   private subscribedUsers: Record<string, UserData>

   /**
    * The future live streams that are fetched from the data bundles
    * Used for generating the recommendations and display the live streams
    * for the groups the user follows
    */
   private futureLivestreams: LivestreamEvent[]

   /**
    * The past live streams that are fetched from the data bundles
    * Used for generating the user recommendations only
    */
   private pastLivestreams: LivestreamEvent[]

   /**
    * The live streams for each user
    * Recommended and from the companies he is following
    */
   private users: Record<string, UserLivestreams> = {}

   private registeredLivestreams: Record<string, RegisteredLivestreams>

   constructor(
      private readonly userRepo: IUserFunctionsRepository,
      private readonly groupRepo: IGroupFunctionsRepository,
      private readonly notificationsRepo: IEmailFunctionsNotificationRepository,
      private readonly dataLoader: IRecommendationDataFetcher,
      private readonly emailBuilder: NewsletterEmailBuilder,
      private readonly logger: Logger
   ) {}

   /**
    * Checks whether a given set of notification types @param types has been sent taking into account the
    * tolerance days.
    * @param notifications All notifications (per user expected)
    * @param types Types to check for
    * @returns true if any notification in @param notifications is sent according to the tolerance days and types, false otherwise
    */
   private isSent(
      notifications: EmailNotification[],
      types: EmailNotificationType[]
   ) {
      const notificationByType = (notification: EmailNotification) => {
         const isWithinToleranceDays =
            getDateDifferenceInDays(
               notification.createdAt.toDate(),
               new Date()
            ) > TOLERANCE_DAYS
         return (
            types.includes(notification.details.type) && isWithinToleranceDays
         )
      }
      return Boolean(notifications.find(notificationByType))
   }

   /**
    * Filters all the fetched and subscribed users according to the onboarding project. Users now should only
    * receive the newsletter if the onboarding/guidance step, has reached the live stream step (live stream discovery).
    * Also it takes into consideration, when live stream discovery notification was sent, introducing a tolerance of 2 days as not
    * to send close emails to the user.
    * @param users
    * @returns UserData[] - Filtered users according to onboarding step and tolerance for the last notification
    */
   private async filterUsers(users: UserData[]): Promise<UserData[]> {
      if (!users?.length) return []

      const BATCH_SIZE = 3000

      const processUser = async (user: UserData) => {
         try {
            const notifications =
               await this.notificationsRepo.getUserReceivedNotifications(
                  user.userEmail
               )
            return { user, notifications }
         } catch (error) {
            this.logger.error(
               `Failed to fetch notifications for user ${user.userEmail}:`,
               error
            )
            return { user, notifications: [] }
         }
      }

      const usersDataItems = await processInBatches(
         users,
         BATCH_SIZE,
         processUser,
         this.logger
      )

      const filteredData = usersDataItems.filter((userData) =>
         this.isSent(userData.notifications, [
            "livestream1stRegistrationDiscovery",
         ])
      )

      return filteredData.map((userData) => userData.user)
   }

   /**
    * Fetches the required data for generating the newsletter
    */
   async fetchRequiredData() {
      // start fetching in parallel
      const promises = [
         this.userRepo.getSubscribedUsers(null, LOCATION_FILTERS),
         this.dataLoader.getFutureLivestreams(),
         this.dataLoader.getPastLivestreams(),
         this.userRepo.getAllUserRegisteredLivestreams(null, LOCATION_FILTERS),
      ] as const

      const [
         subscribedUsers,
         futureLivestreams,
         pastLivestreams,
         registeredLivestreams,
      ] = await Promise.all(promises)

      this.logger.info(
         "NewsletterService ~ fetchRequiredData ~ subscribedUsers:",
         subscribedUsers?.length
      )

      this.logger.info("filtering users")

      const filteredUsers =
         (await this.filterUsers(
            subscribedUsers?.length ? subscribedUsers : ([] as UserData[])
         )) ?? []

      this.logger.info("filtered users", filteredUsers?.length)

      this.subscribedUsers = convertDocArrayToDict(filteredUsers)
      this.registeredLivestreams = Object.fromEntries(
         registeredLivestreams.map((registeredLivestream) => [
            registeredLivestream.userEmail,
            registeredLivestream,
         ])
      )
      this.logger.info(
         "NewsletterService ~ fetchRequiredData ~ subscribedUsers:",
         Object.keys(this.subscribedUsers).map(
            (k) => this.subscribedUsers[k].userEmail
         )
      )

      this.futureLivestreams = futureLivestreams ?? []
      this.pastLivestreams = pastLivestreams ?? []

      this.futureLivestreams = this.futureLivestreams.filter((l) => {
         // filter out live streams before now, the bundle might have events for the same day
         // already started/ended, also hide the hidden ones
         return l.start.toDate().getTime() > Date.now() && !l.hidden
      })

      this.logger.info(
         "Total Users subscribed to the newsletter",
         subscribedUsers?.length ?? 0
      )
      this.logger.info(
         "Total Future Live streams fetched",
         futureLivestreams?.length ?? 0
      )
      this.logger.info(
         "Total Past Live streams fetched",
         pastLivestreams?.length ?? 0
      )

      return this
   }

   /**
    * Generates the recommendations for each user and populates the users object
    */
   async generateRecommendations() {
      const BATCH_SIZE = 500

      const processUser = async (userId: string) => {
         const user = this.subscribedUsers[userId]
         if (!user.userEmail) return null

         const recommendationService = new UserEventRecommendationService(
            user,
            this.futureLivestreams,
            this.pastLivestreams,
            null,
            this.registeredLivestreams[user.userEmail],
            false
         )

         const recommendedIds = await recommendationService.getRecommendations(
            3
         )

         return {
            email: user.userEmail,
            recommendations: {
               recommendedLivestreams: recommendedIds.map((id) =>
                  this.futureLivestreams.find((s) => s.id === id)
               ),
               followingCompanies: {},
            },
         }
      }

      const results = await processInBatches(
         Object.keys(this.subscribedUsers),
         BATCH_SIZE,
         processUser,
         this.logger
      )

      results.forEach((result) => {
         if (result) {
            this.users[result.email] = result.recommendations
         }
      })

      return this
   }

   /**
    * Grabs all company followers, and populates the users object
    * with the live streams for each group the user is following
    */
   async populateUsers() {
      const allCompanyFollowers =
         await this.groupRepo.getAllCompaniesFollowers()
      this.logger.info(
         "Total company followers",
         allCompanyFollowers?.length ?? 0
      )

      if (!allCompanyFollowers) return

      let followersWithGroupLivestreams = 0
      for (const follower of allCompanyFollowers) {
         if (!follower.user.id) continue // no user email present?

         if (!this.users[follower.user.id]) {
            // this user is not subscribed to the newsletter
            continue
         }

         const groupLivestreams = this.futureLivestreams.filter((s) =>
            s.groupIds?.includes(follower.groupId)
         )

         if (groupLivestreams.length === 0) {
            // nothing to populate, this group doesn't have future live streams
            continue
         }

         // add the group live streams to the user
         this.users[follower.user.id].followingCompanies[follower.groupId] = {
            livestreams: groupLivestreams,
            group: follower.group,
         }
         followersWithGroupLivestreams++
      }

      this.logger.info(
         "Total Company Followers whose groups have future live streams",
         followersWithGroupLivestreams++
      )
   }

   /**
    * Sends the newsletter to the subscribed users
    *
    * Possibility of overriding the users to send the newsletter to
    * for testing purposes
    */
   send(overrideUsers?: string[]) {
      const emails = overrideUsers ?? Object.keys(this.users)
      this.logger.info("Total emails to send to", emails.length)
      this.logger.info("Users data", this.users)
      if (overrideUsers) {
         this.logger.info("Override users provided", overrideUsers)
      }
      // counters
      const usersWithoutMinimumRecommendedLivestreams = []
      const sentEmails = []

      for (const userEmail of emails) {
         const user = this.users[userEmail]

         if (user) {
            if (user.recommendedLivestreams.length < 3) {
               // we need at least 3 recommended live streams to send the newsletter
               usersWithoutMinimumRecommendedLivestreams.push(userEmail)
               continue
            }

            const name = this.subscribedUsers[userEmail]?.firstName ?? ""

            const followingLivestreams = Object.values(user.followingCompanies)
               .map((g) => g.livestreams)
               .flat()
               .sort(sortLivestreamsDesc)

            this.emailBuilder.addRecipient(
               userEmail,
               name,
               followingLivestreams,
               user.recommendedLivestreams
            )
            sentEmails.push(userEmail)
         }
      }

      this.logger.info(
         "Total Users without minimum recommended live streams",
         usersWithoutMinimumRecommendedLivestreams.length,
         {
            // so that we can investigate later
            ids: usersWithoutMinimumRecommendedLivestreams,
         }
      )

      return this.emailBuilder.send().then(() => {
         console.log("🚀 Emails sent to:", sentEmails)
      })
   }
}
