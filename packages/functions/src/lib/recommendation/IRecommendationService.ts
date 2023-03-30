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

export type Logger = {
   debug: (...args: any[]) => void
   info: (...args: any[]) => void
   warn: (...args: any[]) => void
   error: (...args: any[]) => void
}

export default class RecommendationServiceCore {
   protected log: Logger

   constructor(log: Logger) {
      this.log = log
   }
}
