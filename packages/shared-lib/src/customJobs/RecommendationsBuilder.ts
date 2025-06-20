import { removeDuplicateDocuments } from "../BaseFirebaseRepository"
import { sortRankedByPoints } from "../recommendation/utils"
import { RankedCustomJob } from "./RankedCustomJob"

export class RecommendationsBuilder {
   protected results: RankedCustomJob[] = []

   constructor(public limit: number) {}

   protected addResults(customJobs: RankedCustomJob[]) {
      this.results = this.results.concat(customJobs)
   }

   protected setResults(customJobs: RankedCustomJob[]) {
      this.results = customJobs
   }

   public get(
      applyCustomPoints?: (rankedCustomJobs: RankedCustomJob) => void
   ): RankedCustomJob[] {
      const uniqueEvents = removeDuplicateDocuments(
         this.results.filter(Boolean).flat()
      )

      if (applyCustomPoints) {
         uniqueEvents.forEach(applyCustomPoints)
      }

      // return the list already sorted
      const rankedCustomJobs = sortRankedByPoints<RankedCustomJob>(
         uniqueEvents
      ).slice(0, this.limit)

      return rankedCustomJobs
   }
}
