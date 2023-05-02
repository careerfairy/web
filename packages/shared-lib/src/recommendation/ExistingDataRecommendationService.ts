import { LivestreamEvent } from "../livestreams"
import { UserData } from "../users"
import { Logger } from "../utils/types"
import RecommendationServiceCore, {
   IRecommendationService,
} from "./IRecommendationService"
import { RankedLivestreamEvent } from "./RankedLivestreamEvent"

/**
 * Sorts the best events for the given user from the received events
 * */
export default class ExistingDataRecommendationService
   extends RecommendationServiceCore
   implements IRecommendationService
{
   constructor(
      logger: Logger,
      private readonly livestreams: LivestreamEvent[],
      private readonly user?: UserData, // User could be undefined if the user is not logged in
      debug = true
   ) {
      super(logger, debug)
   }

   /**
    * Returns a promise just to keep the interface contract
    * Does not actually fetch any data
    */
   async getRecommendations(limit = 10): Promise<string[]> {
      let eventsBasedOnUser: RankedLivestreamEvent[] = []
      if (this.user) {
         // If the user is logged in, we can use their data to recommend events
         eventsBasedOnUser = this.getRecommendedEventsBasedOnUserData(
            this.user,
            this.livestreams,
            limit
         )
      }

      return this.process(eventsBasedOnUser, limit, this.livestreams, this.user)
   }

   static create(
      logger: Logger,
      user: UserData,
      livestreams: LivestreamEvent[],
      debug = false
   ): IRecommendationService {
      return new ExistingDataRecommendationService(
         logger,
         livestreams,
         user,
         debug
      )
   }
}
