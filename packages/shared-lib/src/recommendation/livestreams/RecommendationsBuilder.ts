import { removeDuplicateDocuments } from "../../BaseFirebaseRepository"
import { RankedLivestreamEvent } from "./RankedLivestreamEvent"
import { sortRankedByPoints } from "../utils"

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
      return sortRankedByPoints<RankedLivestreamEvent>(uniqueEvents).slice(
         0,
         this.limit
      )
   }
}
