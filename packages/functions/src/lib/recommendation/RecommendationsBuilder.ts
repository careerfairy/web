import { removeDuplicateDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Logger } from "./IRecommendationService"
import {
   RankedLivestreamEvent,
   handlePromisesAllSettled,
   sortRankedLivestreamEventByPoints,
} from "./util"

export class RecommendationsBuilder {
   protected promises: Promise<RankedLivestreamEvent[]>[] = []

   constructor(protected readonly log: Logger, public limit: number) {}

   public async get(): Promise<RankedLivestreamEvent[]> {
      // Get the resolved results from the promises
      const results = await handlePromisesAllSettled(
         this.promises,
         this.log.error
      )

      const uniqueEvents = removeDuplicateDocuments(
         results.filter(Boolean).flat()
      )

      // return the list already sorted
      return sortRankedLivestreamEventByPoints(uniqueEvents).slice(
         0,
         this.limit
      )
   }
}
