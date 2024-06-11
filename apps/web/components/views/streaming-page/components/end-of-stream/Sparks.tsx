import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Skeleton } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useUserSparks } from "components/custom-hook/spark/useUserSparks"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import {
   GenericCarousel,
   useGenericCarousel,
} from "components/views/common/carousels/GenericCarousel"
import SparkCarouselCard from "components/views/sparks/components/spark-card/SparkCarouselCard"
import SparkCarouselCardSkeleton from "components/views/sparks/components/spark-card/SparkCarouselCardSkeleton"
import useEmblaCarousel from "embla-carousel-react/components/useEmblaCarousel"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { ReactNode } from "react"
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
   showCardBoxShadows: {
      pb: 0.5,
      mb: -0.5,
      px: 0.2,
      mx: -0.2,
   },
})

export const Streams = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const plugins = [WheelGesturesPlugin()]

const Content = () => {
   const { data: sparks } = useUserSparks()
   const streamIsMobile = useStreamIsMobile()

   return (
      <EndOfStreamContainer
         sx={Boolean(streamIsMobile) && styles.noRightPadding}
      >
         <Heading>Discover more interesting topic with Sparks!</Heading>

         <ResponsiveCarousel disableSwipe={!streamIsMobile}>
            {sparks.map((spark) => (
               <SparkCard key={spark.id} spark={spark} />
            ))}
         </ResponsiveCarousel>
      </EndOfStreamContainer>
   )
}

type ResponsiveCarouselProps = {
   children: ReactNode
   disableSwipe?: boolean
}
const ResponsiveCarousel = ({
   children,
   disableSwipe,
}: ResponsiveCarouselProps) => {
   const streamIsLandscape = useStreamIsLandscape()

   const streamIsMobile = useStreamIsMobile()

   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         active: !disableSwipe,
      },
      plugins
   )

   return (
      <GenericCarousel
         slideWidth={
            streamIsLandscape ? "360px" : streamIsMobile ? "323px" : "33.3%"
         }
         gap={streamIsMobile ? "12px" : "16px"}
         emblaRef={emblaRef}
         emblaApi={emblaApi}
      >
         {children}
      </GenericCarousel>
   )
}

type SparkCardProps = {
   spark: Spark
}
const SparkCard = ({ spark }: SparkCardProps) => {
   const emblaApi = useGenericCarousel()
   return (
      <SparkCarouselCard spark={spark} onGoNext={() => emblaApi.scrollNext()} />
   )
}

const Loader = () => {
   return (
      <EndOfStreamContainer sx={styles.noRightPadding}>
         <Heading>
            <Skeleton width={280} />
         </Heading>
         <ResponsiveCarousel disableSwipe>
            <SparkCarouselCardSkeleton />
            <SparkCarouselCardSkeleton />
            <SparkCarouselCardSkeleton />
         </ResponsiveCarousel>
      </EndOfStreamContainer>
   )
}
