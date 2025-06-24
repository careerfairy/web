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

   public get(): RankedCustomJob[] {
      return this.results
      // const uniqueEvents = removeDuplicateDocuments(
      //    this.results.filter(Boolean).flat()
      // )

      // if (applyCustomPoints) {
      //    uniqueEvents.forEach(applyCustomPoints)
      // }

      // // return the list already sorted
      // const rankedCustomJobs = sortRankedByPoints<RankedCustomJob>(
      //    uniqueEvents
      // ).slice(0, this.limit)

      // return rankedCustomJobs
   }
}
