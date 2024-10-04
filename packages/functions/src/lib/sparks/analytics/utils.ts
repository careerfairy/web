import { CompetitorSparkData } from "@careerfairy/shared-lib/sparks/analytics"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

export function convertSparkToCompetitorStaticCardData(
   spark: Spark
): CompetitorSparkData["sparkData"] {
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
         question: spark.question,
         categoryId: spark.category.id,
         videoThumbnailUrl: spark.video.thumbnailUrl,
      },
   }
}
