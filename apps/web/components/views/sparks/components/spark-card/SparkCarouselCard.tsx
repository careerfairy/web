import { FC, useEffect, useRef, useState } from "react"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import Box from "@mui/material/Box"
import { sxStyles } from "types/commonTypes"
import SparkHeader from "./SparkHeader"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkQuestion from "./SparkQuestion"
import { Stack } from "@mui/material"
import SparkCarouselCardContainer from "./SparkCarouselCardContainer"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { debounce } from "lodash"

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
}

const SparkCarouselCard: FC<Props> = ({
   spark,
   onClick,
   preview = false,
   onGoNext,
}) => {
   const sparkPresenter = SparkPresenter.createFromFirebaseObject(spark)
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
            url: sparkPresenter.getTransformedVideoUrl(),
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
            <SparkQuestion question={spark.question}></SparkQuestion>
         </Stack>
      </SparkCarouselCardContainer>
   )
}

export default SparkCarouselCard
