import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import {
   getDateDifferenceInDays,
   sortLivestreamsDesc,
} from "@careerfairy/shared-lib/utils"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { IGroupFunctionsRepository } from "../../GroupFunctionsRepository"
import { NewsletterEmailBuilder } from "../NewsletterEmailBuilder"
import { IRecommendationDataFetcher } from "../../recommendation/services/DataFetcherRecommendations"
import UserEventRecommendationService from "../../recommendation/UserEventRecommendationService"
import { IUserFunctionsRepository } from "../../UserFunctionsRepository"
import { IEmailNotificationRepository as IEmailFunctionsNotificationRepository } from "@careerfairy/shared-lib/notifications/IEmailNotificationRepository"
import {
   EmailNotification,
   EmailNotificationType,
} from "@careerfairy/shared-lib/notifications/notifications"

const TOLERANCE_DAYS = 2
/**
 * Data structure used to associate each user with his recommended livestreams
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
    * The future livestreams that are fetched from the data bundles
    * Used for generating the recommendations and display the livestreams
    * for the groups the user follows
    */
   private futureLivestreams: LivestreamEvent[]

   /**
    * The past livestreams that are fetched from the data bundles
    * Used for generating the user recommendations only
    */
   private pastLivestreams: LivestreamEvent[]

   /**
    * The livestreams for each user
    * Recommended and from the companies he is following
    */
   private users: Record<string, UserLivestreams> = {}

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
      return notifications.find(notificationByType) !== undefined
   }

   /**
    * Filters are the fetched and subscribed users according to the onboarding project. Users now should only
    * receive the newsletter if the onboarding/guidance step, has reached the livestream step (livestream discovery).
    * Also it takes into consideration, when livestream discovery notification was sent, introducing a tolerance of 2 days as not
    * to send close emails to the user.
    * @param users
    * @returns UserData[] - Filtered users according to onboarding step and tolerance for the last notification
    */
   private async filterUsers(users: UserData[]): Promise<UserData[]> {
      const promises = users.map(async (user) => {
         const notifications =
            await this.notificationsRepo.getUserReceivedNotifications(
               user.userEmail
            )
         return {
            user: user,
            notifications: notifications,
         }
      })
      const usersDataItems = await Promise.all(promises)
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
         this.userRepo.getSubscribedUsers(),
         this.dataLoader.getFutureLivestreams(),
         this.dataLoader.getPastLivestreams(),
      ] as const

      const [subscribedUsers, futureLivestreams, pastLivestreams] =
         await Promise.all(promises)

      const filteredUsers = await this.filterUsers(
         subscribedUsers as UserData[]
      )
      this.subscribedUsers = convertDocArrayToDict(filteredUsers)
      this.logger.info(
         "NewsletterService ~ fetchRequiredData ~ subscribedUsers:",
         Object.keys(this.subscribedUsers).map(
            (k) => this.subscribedUsers[k].userEmail
         )
      )

      this.futureLivestreams = futureLivestreams
      this.pastLivestreams = pastLivestreams

      this.futureLivestreams = this.futureLivestreams.filter((l) => {
         // filter out livestreams before now, the bundle might have events for the same day
         // already started/ended, also hide the hidden ones
         return l.start.toDate().getTime() > Date.now() && !l.hidden
      })

      this.logger.info(
         "Total Users subscribed to the newsletter",
         subscribedUsers.length
      )
      this.logger.info(
         "Total Future Livestreams fetched",
         futureLivestreams.length
      )
      this.logger.info("Total Past Livestreams fetched", pastLivestreams.length)

      return this
   }

   /**
    * Generates the recommendations for each user and populates the users object
    */
   async generateRecommendations() {
      for (const userId of Object.keys(this.subscribedUsers)) {
         const user = this.subscribedUsers[userId]
         if (user.userEmail) {
            const recommendationService = new UserEventRecommendationService(
               user,
               this.futureLivestreams,
               this.pastLivestreams,
               false
            )

            // no need to parallelize this, all the promises should be resolved
            // its just a matter of waiting for the event loop to go through
            // all the values
            const recommendedIds =
               await recommendationService.getRecommendations(3)

            this.users[user.userEmail] = {
               recommendedLivestreams: recommendedIds.map((id) =>
                  this.futureLivestreams.find((s) => s.id === id)
               ),
               followingCompanies: {},
            }
         }
      }

      return this
   }

   /**
    * Grabs all company followers, and populates the users object
    * with the livestreams for each group the user is following
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
            // nothing to populate, this group doesn't have future livestreams
            continue
         }

         // add the group livestreams to the user
         this.users[follower.user.id].followingCompanies[follower.groupId] = {
            livestreams: groupLivestreams,
            group: follower.group,
         }
         followersWithGroupLivestreams++
      }

      this.logger.info(
         "Total Company Followers whose groups have future livestreams",
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

      // counters
      const usersWithoutMinimumRecommendedLivestreams = []

      for (const userEmail of emails) {
         const user = this.users[userEmail]

         if (user.recommendedLivestreams.length < 3) {
            // we need at least 3 recommended livestreams to send the newsletter
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
      }

      this.logger.info(
         "Total Users without minimum recommended livestreams",
         usersWithoutMinimumRecommendedLivestreams.length,
         {
            // so that we can investigate later
            ids: usersWithoutMinimumRecommendedLivestreams,
         }
      )

      return this.emailBuilder.send()
   }
}
