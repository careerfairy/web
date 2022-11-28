/**
 * The ID of the element we wish to get recommendations for
 * */
type IdToRecommend = string

/**
 * The outputted IDs of recommendations for the given {@link IdToRecommend}
 */
type Recommendations = string[]

/**
 * The maximum number of recommendations
 * */
type MaxRecommendations = number

export interface IRecommendationService {
   getRecommendations(
      id: IdToRecommend,
      limit?: MaxRecommendations
   ): Promise<Recommendations>
}

type Logger = {
   debug: (...args: any[]) => void
   info: (...args: any[]) => void
   warn: (...args: any[]) => void
   error: (...args: any[]) => void
}

export default class RecommendationServiceCore {
   public readonly serviceName: string
   protected log: Logger

   constructor(serviceName: string, log: Logger) {
      this.serviceName = serviceName
      this.log = log
   }
}
