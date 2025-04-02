import { removeDuplicateDocuments } from "../../BaseFirebaseRepository"
import { sortRankedByPoints } from "../utils"
import { RankedSpark } from "./RankedSpark"

export class RecommendationsBuilder {
   protected results: RankedSpark[] = []

   constructor(public limit: number) {}

   protected addResults(sparks: RankedSpark[]) {
      this.results = this.results.concat(sparks)
   }

   protected setResults(sparks: RankedSpark[]) {
      this.results = sparks
   }

   public get(): RankedSpark[] {
      const uniqueEvents = removeDuplicateDocuments(
         this.results.filter(Boolean).flat()
      )

      // return the list already sorted
      return sortRankedByPoints<RankedSpark>(uniqueEvents).slice(0, this.limit)
   }
}
