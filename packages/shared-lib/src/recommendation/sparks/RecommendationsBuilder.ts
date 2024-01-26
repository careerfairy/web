import { removeDuplicateDocuments } from "../../BaseFirebaseRepository"
import { RankedSpark, sortRankedSparksByPoints } from "./RankedSpark"

export class RecommendationsBuilder {
   protected results: RankedSpark[] = []

   constructor(public limit: number) {}

   protected addResults(sparks: RankedSpark[]) {
      this.results = this.results.concat(sparks)
   }

   public get(): RankedSpark[] {
      const uniqueEvents = removeDuplicateDocuments(
         this.results.filter(Boolean).flat()
      )

      // return the list already sorted
      return sortRankedSparksByPoints(uniqueEvents).slice(0, this.limit)
   }
}
