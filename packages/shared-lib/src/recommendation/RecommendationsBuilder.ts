import { removeDuplicateDocuments } from "../BaseFirebaseRepository"
import {
   RankedLivestreamEvent,
   sortRankedLivestreamEventByPoints,
} from "./RankedLivestreamEvent"

export class RecommendationsBuilder {
   protected results: RankedLivestreamEvent[] = []

   constructor(public limit: number) {}

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
