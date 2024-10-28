import { Box, SxProps, Theme } from "@mui/material"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import SparkCarouselCard from "./spark-card/SparkCarouselCard"

import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const SPARK_CARD_WIDTH = 241
const SPARK_CARD_HEIGHT = 350

const styles = sxStyles({
   viewport: {
      // hack to ensure overflow visibility with parent padding
      padding: "16px",
      margin: "-16px",
      width: "calc(100% + 32px)",
   },
   cardWrapper: {
      width: SPARK_CARD_WIDTH,
      height: SPARK_CARD_HEIGHT,
   },
})

type SparksCarouselProps = {
   header: ReactNode
   handleSparksClicked: (spark: Spark) => void
   containerSx?: SxProps<Theme>
   headerSx?: SxProps<Theme>
   sparks: Spark[]
}

export const SparksCarousel = ({
   header,
   sparks,
   handleSparksClicked,
   containerSx,
   headerSx,
}: SparksCarouselProps) => {
   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: false,
         axis: "x",
      },
      [WheelGesturesPlugin()]
   )

   return (
      <Box sx={containerSx}>
         <ContentCarousel
            slideWidth={SPARK_CARD_WIDTH}
            headerTitle={header}
            emblaProps={{
               emblaRef,
               emblaApi,
            }}
            viewportSx={styles.viewport}
            headerSx={headerSx}
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
      </Box>
   )
}
