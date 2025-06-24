import { removeDuplicateDocuments } from "../BaseFirebaseRepository"
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
      return removeDuplicateDocuments(this.results.flat())
   }
}
