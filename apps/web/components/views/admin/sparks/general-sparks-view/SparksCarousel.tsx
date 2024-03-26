import React, { ReactNode, useEffect, useRef, useState } from "react"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import SparkCarouselCardForAdmin from "components/views/sparks/components/spark-card/SparkCarouselCardForAdmin"
import SparkCarouselCard, {
   AUTO_PLAY_TIME,
} from "components/views/sparks/components/spark-card/SparkCarouselCard"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { sxStyles } from "types/commonTypes"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import useIsMobile from "components/custom-hook/useIsMobile"
import { debounce } from "lodash"

const slideSpacing = 21
const desktopSlideWidth = 306 + slideSpacing
const mobileSlideWidth = 280 + slideSpacing

const styles = sxStyles({
   viewport: {
      overflow: "hidden",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
      marginLeft: `calc(${slideSpacing}px * -1)`,
   },
   slide: {
      flex: {
         xs: `0 0 ${mobileSlideWidth}px`,
         md: `0 0 ${desktopSlideWidth}px`,
      },
      minWidth: 0,
      paddingLeft: `${slideSpacing}px`,
      position: "relative",
      height: {
         xs: 405,
         md: 443,
      },
   },
   paddingSlide: {
      flex: `0 0 ${slideSpacing}px`,
   },
})

export type ChildRefType = {
   goNext: () => void
   goPrev: () => void
}

type PropType = {
   options?: EmblaOptionsType
   sparks?: Spark[]
   onSparkClick?: (spark: Spark) => void
   children?: ReactNode[]
   isAdmin?: boolean
}

const SparksCarousel = React.forwardRef<ChildRefType, PropType>(
   (props, ref) => {
      const { options, sparks, onSparkClick, children, isAdmin } = props
      const [emblaRef, emblaApi] = useEmblaCarousel(options, [
         WheelGesturesPlugin(),
      ])

      React.useImperativeHandle(ref, () => ({
         goNext() {
            emblaApi.scrollNext()
         },
         goPrev() {
            emblaApi.scrollPrev()
         },
      }))

      return (
         <Box sx={styles.viewport} ref={emblaRef}>
            <Box sx={styles.container}>
               {sparks?.length
                  ? sparks.map((spark) => (
                       <Content
                          key={spark.id}
                          sparks={sparks}
                          currentSpark={spark}
                          isAdmin={isAdmin}
                          handleClick={() => onSparkClick(spark)}
                          handleGoNext={() => emblaApi.scrollNext()}
                       />
                       //   <Box key={spark.id} sx={styles.slide}>

                       //      {isAdmin ? (
                       //         <SparkCarouselCardForAdmin
                       //            onClick={() => onSparkClick(spark)}
                       //            spark={spark}
                       //         />
                       //      ) : (
                       //         <SparkCarouselCard
                       //            onClick={() => onSparkClick(spark)}
                       //            spark={spark}
                       //            onGoNext={() => emblaApi.scrollNext()}
                       //            isLastPosition={
                       //               spark.id === sparks[sparks.length - 1].id
                       //            }
                       //         />
                       //      )}
                       //   </Box>
                    ))
                  : children?.map((child, i) => (
                       <Box key={i} sx={styles.slide}>
                          {child}
                       </Box>
                    ))}
               {/**
                * This prevents the last slide from touching the right edge of the viewport.
                */}
               <Box sx={styles.paddingSlide}></Box>
            </Box>
         </Box>
      )
   }
)

SparksCarousel.displayName = "SparksCarousel"

export default SparksCarousel

const Content = ({
   sparks,
   currentSpark,
   handleClick,
   isAdmin,
   handleGoNext,
}) => {
   const [autoPlaying, setAutoPlaying] = useState(false)
   const containerRef = useRef<HTMLDivElement>(null)
   const isMobile = useIsMobile()

   const isLastPosition = currentSpark.id === sparks[sparks.length - 1].id

   // Set up intersection observer to handle auto-playing
   useEffect(() => {
      const currentContainerRef = containerRef.current
      let timeout

      const observable = (entries) => {
         const entry = entries[0]

         if (entry && entry.intersectionRatio > 0.9) {
            timeout = setTimeout(() => {
               setAutoPlaying(true)
            }, 1000)
         } else {
            setAutoPlaying(false)
            clearTimeout(timeout)
         }
      }

      const debouncedObservable = debounce(observable, 300)

      const observer = new IntersectionObserver(debouncedObservable, {
         threshold: 0.9,
      })

      if (isMobile && containerRef.current) {
         observer.observe(containerRef.current)
      }

      return () => {
         // if (currentContainerRef) {
         observer.unobserve(currentContainerRef)
         // }
         clearTimeout(timeout)
      }
   }, [isMobile])

   // Set up auto-playing timeout for mobile experience
   useEffect(() => {
      let timeout

      if (autoPlaying && isMobile) {
         timeout = setTimeout(() => {
            if (isLastPosition) {
               // if it's the last spark on the carousel and already auto-played we should set the autoPlaying to false and do nothing
               setAutoPlaying(false)
            } else {
               // After auto-play we should transition to the next spark
               handleGoNext && handleGoNext()
            }
         }, AUTO_PLAY_TIME)
      }

      return () => {
         clearTimeout(timeout)
      }
   }, [autoPlaying, handleGoNext, isLastPosition, isMobile])

   return (
      <Box
         key={currentSpark.id}
         sx={styles.slide}
         ref={containerRef}
         onMouseEnter={isMobile && isAdmin ? null : () => setAutoPlaying(true)}
         onMouseLeave={isMobile && isAdmin ? null : () => setAutoPlaying(false)}
      >
         {isAdmin ? (
            <SparkCarouselCardForAdmin
               onClick={handleClick}
               spark={currentSpark}
            />
         ) : (
            <SparkCarouselCard
               onClick={handleClick}
               spark={currentSpark}
               autoPlaying={autoPlaying}
               // onGoNext={handleGoNext}
               // isLastPosition={
               //    currentSpark.id === sparks[sparks.length - 1].id
               // }
            />
         )}
      </Box>
   )
}
