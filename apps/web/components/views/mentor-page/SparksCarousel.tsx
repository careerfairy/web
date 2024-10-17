import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Box } from "@mui/material"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { useRouter } from "next/router"
import { ReactNode } from "react"
import { useDispatch } from "react-redux"
import {
   setCameFromPageLink,
   setCreatorId,
   setFetchedCompanyWithCreatorStatus,
} from "store/reducers/sparksFeedReducer"
import { sxStyles } from "types/commonTypes"
import SparkCarouselCard from "../sparks/components/spark-card/SparkCarouselCard"
import { ContentCarousel } from "./ContentCarousel"

const SPARK_CARD_WIDTH = 241
const SPARK_CARD_HEIGHT = 350

const styles = sxStyles({
   viewport: {
      // hack to ensure overflow visibility with parent padding
      padding: "16px",
      margin: "-16px",
      width: "calc(100% + 32px)",
   },
   carouselContainer: {
      width: "100%",
      gap: "12px",
      overflow: "visible !important",
   },
   cardWrapper: {
      width: SPARK_CARD_WIDTH,
      height: SPARK_CARD_HEIGHT,
   },
})

type SparksCarousel = {
   sparks: Spark[]
   disableClick?: boolean
   title?: ReactNode | string
}

export const SparksCarousel = ({
   sparks,
   disableClick,
   title = "",
}: SparksCarousel) => {
   const router = useRouter()
   const dispatch = useDispatch()

   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: false,
         axis: "x",
      },
      [WheelGesturesPlugin()]
   )

   const handleSparksClicked = (spark: Spark) => {
      if (!spark || disableClick) return

      dispatch(setCameFromPageLink(router.asPath))
      dispatch(setCreatorId(spark.creator.id))
      dispatch(setFetchedCompanyWithCreatorStatus("started"))

      return router.push({
         pathname: `/sparks/${spark.id}`,
         query: {
            creatorId: spark.creator.id,
            interactionSource: SparkInteractionSources.Mentor_Page,
         },
      })
   }

   return (
      <ContentCarousel
         slideWidth={SPARK_CARD_WIDTH}
         headerTitle={title}
         emblaProps={{
            emblaRef,
            emblaApi,
         }}
         viewportSx={styles.viewport}
      >
         {sparks.map((spark) => (
            <Box key={spark.id} sx={styles.cardWrapper}>
               <SparkCarouselCard
                  spark={spark}
                  onClick={() => handleSparksClicked(spark)}
                  onGoNext={() => emblaApi?.scrollNext()}
                  questionLimitLines={true}
               />
            </Box>
         ))}
      </ContentCarousel>
   )
}
