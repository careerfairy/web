import { removeDuplicateDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import {
   RankedLivestreamEvent,
   sortRankedLivestreamEventByPoints,
} from "./util"

export class RecommendationsBuilder {
   protected results: RankedLivestreamEvent[] = []

   constructor(protected readonly log: Logger, public limit: number) {}

   protected addResults(livestreams: RankedLivestreamEvent[]) {
      this.results = this.results.concat(livestreams)
   }

   public get(): RankedLivestreamEvent[] {
      const uniqueEvents = removeDuplicateDocuments(
         this.results.filter(Boolean).flat()
      )

      // return the list already sorted
      return sortRankedLivestreamEventByPoints(uniqueEvents).slice(
         0,
         this.limit
      )
   }
}
