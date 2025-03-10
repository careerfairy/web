import { removeDuplicateDocuments } from "../../BaseFirebaseRepository"
import { FieldOfStudyCategoryMap } from "../../fieldOfStudy"
import { Group } from "../../groups"
import { UserData } from "../../users"
import { sortRankedByPoints } from "../utils"
import { RankedSpark } from "./RankedSpark"
import { FEATURED_GROUP_SPARK_POINTS_MULTIPLIER } from "./service/RankedSparkRepository"

export class RecommendationsBuilder {
   protected results: RankedSpark[] = []

   constructor(public limit: number) {}

   protected addResults(sparks: RankedSpark[]) {
      this.results = this.results.concat(sparks)
   }

   public get(
      sparkGroups: { [sparkId: string]: Group } = {},
      userData?: UserData
   ): RankedSpark[] {
      if (userData) {
         console.log(
            "🚀 Recommending sparks for user(id, fieldOfStudy, countryIsoCode):",
            userData.id,
            userData.fieldOfStudy?.id,
            userData.countryIsoCode
         )
      }
      const uniqueEvents = removeDuplicateDocuments(
         this.results.filter(Boolean).flat()
      )
         // If sparks groups are provided, we multiply the points of the sparks that belong to a featured group if
         // the user belongs to the target audience and the target country of the featured group
         .map((rankedSpark) => {
            const group = sparkGroups[rankedSpark.model.spark.group.id]

            if (
               userData?.fieldOfStudy?.id &&
               userData?.countryIsoCode &&
               group?.featured?.targetCountries?.length &&
               group.featured?.targetAudience?.length
            ) {
               const belongsToTargetAudience =
                  group.featured.targetAudience.some(
                     (audience) =>
                        audience ===
                        FieldOfStudyCategoryMap[userData.fieldOfStudy.id]
                  )
               const belongsToTargetCountry =
                  group.featured.targetCountries.some(
                     (country) => country === userData.countryIsoCode
                  )

               if (belongsToTargetAudience && belongsToTargetCountry) {
                  const points =
                     rankedSpark.getPoints() *
                     FEATURED_GROUP_SPARK_POINTS_MULTIPLIER
                  console.log(
                     "🚀 user id, spark id, points, multiplied points:",
                     userData?.id,
                     rankedSpark.model.spark.id,
                     rankedSpark.getPoints(),
                     points
                  )
                  rankedSpark.setPoints(points)
               } else {
                  console.log(
                     "🚀 user id, spark id, points, not multiplied points:",
                     userData?.id,
                     rankedSpark.model.spark.id,
                     rankedSpark.getPoints()
                  )
               }
            } else {
               console.log(
                  "🚀 user id, spark id, points, group not featured points:",
                  userData?.id,
                  rankedSpark.model.spark.id,
                  rankedSpark.getPoints()
               )
            }

            return rankedSpark
         })

      // return the list already sorted
      return sortRankedByPoints<RankedSpark>(uniqueEvents).slice(0, this.limit)
   }
}
