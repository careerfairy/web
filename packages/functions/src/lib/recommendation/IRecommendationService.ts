import { Logger } from "@careerfairy/shared-lib/utils/types"

/**
 * The outputted IDs of recommendations for the given {@link IdToRecommend}
 */
type Recommendations = string[]

/**
 * The maximum number of recommendations
 * */
type MaxRecommendations = number

export interface IRecommendationService {
   getRecommendations(limit?: MaxRecommendations): Promise<Recommendations>
}

export default class RecommendationServiceCore {
   protected log: Logger

   constructor(log: Logger) {
      this.log = log
   }
}
