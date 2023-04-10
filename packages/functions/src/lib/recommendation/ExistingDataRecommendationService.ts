import functions = require("firebase-functions")
import { UserData } from "@careerfairy/shared-lib/users"

import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import RecommendationServiceCore, {
   IRecommendationService,
} from "./IRecommendationService"

/**
 * Sorts the best events for the given user from the received events
 * */
export default class ExistingDataRecommendationService
   extends RecommendationServiceCore
   implements IRecommendationService
{
   constructor(
      private readonly user: UserData,
      private readonly livestreams: LivestreamEvent[],
      debug = true
   ) {
      super(functions.logger, debug)
   }

   /**
    * Returns a promise just to keep the interface contract
    * Does not actually fetch any data
    */
   async getRecommendations(limit = 10): Promise<string[]> {
      const eventsBasedOnUser = this.getRecommendedEventsBasedOnUserData(
         this.user,
         this.livestreams,
         limit
      )

      return this.process(eventsBasedOnUser, limit, this.user)
   }

   static create(
      user: UserData,
      livestreams: LivestreamEvent[]
   ): IRecommendationService {
      return new ExistingDataRecommendationService(user, livestreams)
   }
}
