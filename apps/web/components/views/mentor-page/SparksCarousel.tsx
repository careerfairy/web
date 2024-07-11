import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Box } from "@mui/material"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { useRouter } from "next/router"
import { sxStyles } from "types/commonTypes"
import SparkCarouselCard from "../sparks/components/spark-card/SparkCarouselCard"
import { ContentCarousel } from "./ContentCarousel"

const SPARK_CARD_WIDTH = 241
const SPARK_CARD_HEIGHT = 350

const styles = sxStyles({
   carouselContainer: {
      width: "100%",
      gap: "12px",
      overflow: "visible !important",
   },
   cardWrapper: {
      width: SPARK_CARD_WIDTH,
      height: SPARK_CARD_HEIGHT,
   },
   lastCard: {
      paddingRight: "16px",
   },
})

type SparksCarousel = {
   sparks: Spark[]
}

export const SparksCarousel = ({ sparks }: SparksCarousel) => {
   const router = useRouter()

   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: false,
         axis: "x",
      },
      [WheelGesturesPlugin()]
   )

   const handleSparksClicked = (spark: Spark) => {
      if (!spark) return

      return router.push({
         pathname: `/sparks/${spark.id}?creatorId=${spark.creator.id}`,
         query: {
            ...router.query, // spread current query params
            interactionSource: SparkInteractionSources.Mentor_Page,
         },
      })
   }

   return (
      <ContentCarousel
         slideWidth={SPARK_CARD_WIDTH}
         headerTitle="My Sparks"
         emblaProps={{
            emblaRef,
            emblaApi,
         }}
      >
         {sparks.map((spark, index) => (
            <Box
               key={spark.id}
               sx={[
                  styles.cardWrapper,
                  index === sparks.length - 1 ? styles.lastCard : {},
               ]}
            >
               <SparkCarouselCard
                  spark={spark}
                  onClick={() => handleSparksClicked(spark)}
                  onGoNext={() => emblaApi?.scrollNext()}
               />
            </Box>
         ))}
      </ContentCarousel>
   )
}
