import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark, getCategoryById } from "@careerfairy/shared-lib/sparks/sparks"
import SEO from "components/util/SEO"
import { OpenGraph } from "next-seo/lib/types"

type SparkSeoProps = {
   spark?: Spark | SparkPresenter | null
}

const SparkSeo: React.FC<SparkSeoProps> = ({ spark }) => {
   if (!spark) {
      return null
   }

   return (
      <SEO
         title={spark.question}
         description={`Learn about ${
            getCategoryById(spark.category.id).name
         } at ${spark.group.universityName}.`}
         openGraph={getSparkOpenGraph(spark)}
         twitter={{
            cardType: "player",
         }}
      />
   )
}

const getSparkOpenGraph = (spark: Spark | SparkPresenter): OpenGraph => {
   return {
      type: "video.other",
      title: spark.question,
      description: `Learn about ${getCategoryById(spark.category.id).name} at ${
         spark.group.universityName
      }.`,
      images: [
         {
            url: spark.video.thumbnailUrl,
            width: 800,
            height: 600,
            alt: `Thumbnail for ${spark.question}`,
         },
      ],
      videos: [
         {
            url: spark.video.url,
            secureUrl: spark.video.url,
            type: `video/${spark.video.fileExtension}`,
            width: 800,
            height: 600,
         },
      ],
      video: {
         actors: [
            {
               profile: spark.creator.avatarUrl,
               role: `${spark.creator.firstName} ${spark.creator.lastName} - ${spark.creator.position}`,
            },
         ],
         // Add any other relevant metadata here, for instance:
         // duration: spark.videoDurationMs ? spark.videoDurationMs / 1000 : undefined
      },
   }
}

export default SparkSeo
