import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { imageKitLoader } from "@careerfairy/shared-lib/utils/video"
import { Stack } from "@mui/material"
import Box from "@mui/material/Box"
import useIsMobile from "components/custom-hook/useIsMobile"
import { debounce } from "lodash"
import { FC, useEffect, useRef, useState } from "react"
import { sxStyles } from "types/commonTypes"
import SparkCarouselCardContainer from "./SparkCarouselCardContainer"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkHeader from "./SparkHeader"
import SparkQuestion from "./SparkQuestion"

const cardPadding = 2

const styles = sxStyles({
   cardDetails: {
      cursor: "pointer",
      justifyContent: "flex-end",
      gap: "6px",
   },
})

type Props = {
   spark: Spark
   preview?: boolean
   onClick?: () => void
   onGoNext?: () => void
   questionLimitLines?: boolean
}

const SparkCarouselCard: FC<Props> = ({
   spark,
   onClick,
   preview = false,
   onGoNext,
   questionLimitLines,
}) => {
   const [autoPlaying, setAutoPlaying] = useState(false)
   const containerRef = useRef<HTMLDivElement>(null)
   const isMobile = useIsMobile()

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
         observer.unobserve(currentContainerRef)
         clearTimeout(timeout)
      }
   }, [isMobile])

   // Set up auto-playing timeout for mobile experience
   useEffect(() => {
      let timeout

      if (autoPlaying && isMobile) {
         // After auto-play we should transition to the next spark
         timeout = setTimeout(() => {
            setAutoPlaying(false)
            onGoNext && onGoNext()
         }, SPARK_CONSTANTS.SECONDS_TO_AUTO_PLAY)
      }

      return () => {
         clearTimeout(timeout)
      }
   }, [autoPlaying, isMobile, onGoNext])

   return (
      <SparkCarouselCardContainer
         video={{
            thumbnailUrl: spark.video.thumbnailUrl,
            url: imageKitLoader({
               src: spark.video.url,
               height: 640 * 1,
               width: 360 * 1,
               quality: 40,
               maxSizeCrop: true,
            }),
            preview,
         }}
         onMouseEnter={isMobile ? null : () => setAutoPlaying(true)}
         onMouseLeave={isMobile ? null : () => setAutoPlaying(false)}
         autoPlaying={autoPlaying}
         containerRef={containerRef}
      >
         <Box px={cardPadding} pt={cardPadding}>
            <SparkHeader showAdminOptions={false} spark={spark} />
         </Box>
         <Stack
            sx={styles.cardDetails}
            p={cardPadding}
            onClick={onClick}
            flexGrow={1}
         >
            <SparkCategoryChip categoryId={spark.category.id} />
            <SparkQuestion
               question={spark.question}
               limitLines={questionLimitLines}
            />
         </Stack>
      </SparkCarouselCardContainer>
   )
}

export default SparkCarouselCard
