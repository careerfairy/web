import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Box, Skeleton } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useUserSparks } from "components/custom-hook/spark/useUserSparks"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import {
   GenericCarousel,
   GenericCarouselProps,
   useGenericCarousel,
} from "components/views/common/carousels/GenericCarousel"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import React from "react"
import { sxStyles } from "types/commonTypes"
import { EndOfStreamContainer } from "./Container"
import { Heading } from "./Heading"

const styles = sxStyles({
   root: {
      mx: "auto",
   },
   noRightPadding: {
      pr: 0,
   },
   sparkCardWrapper: {
      position: "relative",
      width: "100%",
      paddingTop: "145.23%",
      "& > *": {
         position: "absolute !important",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
      },
   },
   skeleton: {
      width: "100%",
      height: "100%",
      borderRadius: 3,
   },
})

export const Sparks = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const Content = () => {
   const { data: sparks } = useUserSparks()
   const streamIsMobile = useStreamIsMobile()

   return (
      <EndOfStreamContainer
         sx={Boolean(streamIsMobile) && styles.noRightPadding}
      >
         <Heading>Discover more interesting topics with Sparks!</Heading>

         <ResponsiveCarousel>
            {sparks.map((spark) => (
               <SparkCard key={spark.id} spark={spark} />
            ))}
         </ResponsiveCarousel>
      </EndOfStreamContainer>
   )
}

type ResponsiveCarouselProps = {
   children: GenericCarouselProps["children"]
   disableSwipe?: boolean
}

const plugins = [WheelGesturesPlugin()]

const ResponsiveCarousel = ({
   children,
   disableSwipe,
}: ResponsiveCarouselProps) => {
   const streamIsMobile = useStreamIsMobile()

   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         active: !disableSwipe,
      },
      plugins
   )

   const gap = streamIsMobile ? 12 : 16
   const slideWidth = (streamIsMobile ? 241 : 272) + gap

   return (
      <GenericCarousel
         gap={`${gap}px`}
         emblaRef={emblaRef}
         emblaApi={emblaApi}
         preventEdgeTouch
      >
         {React.Children.map(children, (child) => (
            <GenericCarousel.Slide
               slideWidth={`${slideWidth}px`}
               key={child.key}
            >
               {child}
            </GenericCarousel.Slide>
         ))}
      </GenericCarousel>
   )
}

type SparkCardProps = {
   spark: Spark
}
const SparkCard = ({ spark }: SparkCardProps) => {
   const { emblaApi } = useGenericCarousel()
   return (
      <Box sx={styles.sparkCardWrapper}>
         <SparkPreviewCard
            spark={spark}
            onClick={() =>
               window.open(
                  `${getBaseUrl()}/sparks/${spark.id}?interactionSource=${
                     SparkInteractionSources.Livestream_End_Screen
                  }`,
                  "_blank"
               )
            }
            onGoNext={() => emblaApi.scrollNext()}
         />
      </Box>
   )
}

const SparkCardSkeleton = () => {
   return (
      <Box sx={styles.sparkCardWrapper}>
         <Skeleton sx={styles.skeleton} variant="rectangular" />
      </Box>
   )
}

const Loader = () => {
   return (
      <EndOfStreamContainer sx={styles.noRightPadding}>
         <Heading>
            <Skeleton width={280} />
         </Heading>
         <ResponsiveCarousel disableSwipe>
            <SparkCardSkeleton />
            <SparkCardSkeleton />
            <SparkCardSkeleton />
            <SparkCardSkeleton />
         </ResponsiveCarousel>
      </EndOfStreamContainer>
   )
}
