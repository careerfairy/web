import { Box, SxProps, Theme } from "@mui/material"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import SparkPreviewCard from "./spark-card/SparkPreviewCard"

import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { useAutoPlaySparks } from "components/custom-hook/spark/useAutoPlaySparks"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   viewport: {
      // hack to ensure overflow visibility with parent padding
      padding: "16px",
      margin: "-16px",
      width: "calc(100% + 16px)",
   },
})

type SparksCarouselProps = {
   header?: ReactNode
   handleSparksClicked?: (spark: Spark) => void
   containerSx?: SxProps<Theme>
   headerSx?: SxProps<Theme>
   sparks: Spark[]
   disableClick?: boolean
}

export const SparksCarousel = ({
   header,
   sparks,
   handleSparksClicked,
   containerSx,
   headerSx,
   disableClick = false,
}: SparksCarouselProps) => {
   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: false,
         axis: "x",
      },
      [WheelGesturesPlugin()]
   )

   const { shouldDisableAutoPlay, moveToNextSlide } = useAutoPlaySparks(
      sparks.length,
      emblaApi
   )

   return (
      <Box sx={containerSx}>
         <ContentCarousel
            headerTitle={header}
            emblaProps={{
               emblaRef,
               emblaApi,
            }}
            viewportSx={styles.viewport}
            headerSx={headerSx}
         >
            {sparks.map((spark, index) => (
               <SparkPreviewCard
                  key={spark.id}
                  spark={spark}
                  onClick={!disableClick && handleSparksClicked}
                  questionLimitLines={true}
                  onGoNext={moveToNextSlide}
                  disableAutoPlay={shouldDisableAutoPlay(index)}
               />
            ))}
         </ContentCarousel>
      </Box>
   )
}
