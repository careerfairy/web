import { removeDuplicateDocuments } from "../../BaseFirebaseRepository"
import { sortRankedByPoints } from "../utils"
import { RankedSpark } from "./RankedSpark"

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
      // .map((rankedSpark) => {

      //    if (sparkGroups) {
      //       const group = sparkGroups[rankedSpark.model.spark.group.id]
      //       if (group.featured?.targetCountries?.length) {

      //          rankedSpark.addPoints((rankedSpark.getPoints() + 100) * FEATURED_GROUP_SPARK_POINTS_MULTIPLIER)
      //          console.log("🚀 ~ RecommendationsBuilder ~ group, multiplied points, spark id:", group.groupId, rankedSpark.getPoints(), rankedSpark.model.spark.id)
      //       }
      //    }

      //    return rankedSpark
      // })

      // return the list already sorted
      return sortRankedByPoints<RankedSpark>(uniqueEvents).slice(0, this.limit)
   }
}
