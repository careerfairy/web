import { removeDuplicateDocuments } from "../../BaseFirebaseRepository"
import { sortRankedByPoints } from "../utils"
import { RankedLivestreamEvent } from "./RankedLivestreamEvent"

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
      const rankedLivestreams = sortRankedByPoints<RankedLivestreamEvent>(
         uniqueEvents
      ).slice(0, this.limit)

      rankedLivestreams.forEach((l) => {
         console.log(
            `🚀 ~ RecommendationsBuilder POINTS ~ ${
               l.model.id
            }: {companySizes: ${l.getCompanySizes()},companyCountries: ${l.getCompanyCountries()} } -> `,
            l.getPoints()
         )
      })

      return rankedLivestreams
   }
}
