import { CompetitorSparkCard } from "@careerfairy/shared-lib/sparks/analytics"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

export const NUM_SPARKS_LIMIT = 4
export const MIN_NUM_COMPANIES = 3

export function convertSparkToCompetitorSparkCardData(
   spark: Spark
): CompetitorSparkCard {
   return {
      creator: {
         avatarUrl: spark.creator.avatarUrl,
         firstName: spark.creator.firstName,
         lastName: spark.creator.lastName,
      },
      group: {
         id: spark.group.id,
         name: spark.group.universityName,
      },
      spark: {
         id: spark.id,
         question: spark.question,
         categoryId: spark.category.id,
         videoThumbnailUrl: spark.video.thumbnailUrl,
      },
   }
}
