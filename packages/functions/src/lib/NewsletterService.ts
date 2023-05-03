import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { sortLivestreamsDesc } from "@careerfairy/shared-lib/utils"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { IGroupFunctionsRepository } from "./GroupFunctionsRepository"
import { NewsletterEmailBuilder } from "./NewsletterEmailBuilder"
import { IRecommendationDataFetcher } from "./recommendation/services/DataFetcherRecommendations"
import UserEventRecommendationService from "./recommendation/UserEventRecommendationService"
import { IUserFunctionsRepository } from "./UserFunctionsRepository"

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
      private readonly dataLoader: IRecommendationDataFetcher,
      private readonly emailBuilder: NewsletterEmailBuilder,
      private readonly logger: Logger
   ) {}

   /**
    * Fetches the required data for generating the newsletter
    */
   async fetchRequiredData() {
      // start fetching in parallel
      const promises = [
         this.userRepo.getSubscribedUsers(),
         this.dataLoader.getFutureLivestreams(),
         this.dataLoader.getPastLivestreams(),
      ]

      const [subscribedUsers, futureLivestreams, pastLivestreams] =
         await Promise.all(promises)

      this.subscribedUsers = convertDocArrayToDict(
         subscribedUsers as UserData[]
      )
      this.futureLivestreams = futureLivestreams as LivestreamEvent[]
      this.pastLivestreams = pastLivestreams as LivestreamEvent[]

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
