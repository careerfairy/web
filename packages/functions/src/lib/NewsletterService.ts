import { convertDocArrayToDict } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { IGroupFunctionsRepository } from "./GroupFunctionsRepository"
import { IRecommendationDataFetcher } from "./recommendation/services/DataFetcherRecommendations"
import UserEventRecommendationService from "./recommendation/services/UserEventRecommendationService"
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
      private readonly dataLoader: IRecommendationDataFetcher
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

      console.info(
         "Total Users subscribed to the newsletter",
         subscribedUsers.length
      )
      console.info("Total Future Livestreams fetched", futureLivestreams.length)
      console.info("Total Past Livestreams fetched", pastLivestreams.length)

      return this
   }

   /**
    * Generates the recommendations for each user
    * Saves the results in the recommendations property
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

   async populateUsers() {
      const allCompanyFollowers =
         await this.groupRepo.getAllCompaniesFollowers()
      console.info("Total company followers", allCompanyFollowers?.length ?? 0)

      if (!allCompanyFollowers) return

      let followersWithGroupLivestreams = 0
      for (const follower of allCompanyFollowers) {
         if (!follower.user.id) continue // no user email present?

         const groupLivestreams = this.futureLivestreams.filter((s) =>
            s.groupIds?.includes(follower.groupId)
         )

         if (groupLivestreams.length === 0) {
            // nothing to populate, this group doesn't have future livestreams
            continue
         }

         this.users[follower.user.id].followingCompanies[follower.groupId] = {
            livestreams: groupLivestreams,
            group: follower.group,
         }
         followersWithGroupLivestreams++
      }

      console.info(
         "Total Company Followers whose groups have future livestreams",
         followersWithGroupLivestreams++
      )
   }

   send() {
      // get all following groups for all users
   }
}
