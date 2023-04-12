import { LivestreamEvent } from "../livestreams"
import { UserData } from "../users"
import { Logger } from "../utils/types"
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
      logger: Logger,
      private readonly user: UserData,
      private readonly livestreams: LivestreamEvent[],
      debug = true
   ) {
      super(logger, debug)
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
         user,
         livestreams,
         debug
      )
   }
}
