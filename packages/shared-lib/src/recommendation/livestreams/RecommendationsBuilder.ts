import { removeDuplicateDocuments } from "../../BaseFirebaseRepository"
import { sortRankedByPoints } from "../utils"
import { RankedLivestreamEvent } from "./RankedLivestreamEvent"

export class RecommendationsBuilder {
   protected results: RankedLivestreamEvent[] = []

   constructor(public limit: number) {}

   protected addResults(livestreams: RankedLivestreamEvent[]) {
      this.results = this.results.concat(livestreams)
   }

   public get(
      applyCustomPoints?: (rankedLivestream: RankedLivestreamEvent) => void
   ): RankedLivestreamEvent[] {
      // TODO: Add featured groups
      const uniqueEvents = removeDuplicateDocuments(
         this.results.filter(Boolean).flat()
      )

      if (applyCustomPoints) {
         uniqueEvents.forEach(applyCustomPoints)
      }

      // return the list already sorted
      const rankedLivestreams = sortRankedByPoints<RankedLivestreamEvent>(
         uniqueEvents
      ).slice(0, this.limit)

      return rankedLivestreams
   }
}
