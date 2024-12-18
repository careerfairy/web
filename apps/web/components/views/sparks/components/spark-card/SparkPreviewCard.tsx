import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { imageKitLoader } from "@careerfairy/shared-lib/utils/video"
import { Stack } from "@mui/material"
import Box from "@mui/material/Box"
import useIsMobile from "components/custom-hook/useIsMobile"
import { debounce } from "lodash"
import { FC, useEffect, useRef, useState } from "react"
import { sxStyles } from "types/commonTypes"
import SparkCategoryChip from "./SparkCategoryChip"
import SparkHeader from "./SparkHeader"
import SparkPreviewCardContainer, {
   SparkPreviewCardType,
} from "./SparkPreviewCardContainer"
import SparkQuestion from "./SparkQuestion"

const cardPadding = 1.5

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
   onClick?: (spark: Spark) => void
   onGoNext?: () => void
   selectInput?: React.ReactNode
   selected?: boolean
   disableAutoPlay?: boolean
   questionLimitLines?: boolean
   type?: SparkPreviewCardType
   muted?: boolean
   onVideoEnded?: () => void
}

const SparkPreviewCard: FC<Props> = ({
   spark,
   onClick,
   preview = false,
   onGoNext,
   selectInput,
   selected,
   disableAutoPlay,
   questionLimitLines,
   type = "carousel",
   muted = false,
   onVideoEnded,
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

      if (isMobile && !disableAutoPlay && containerRef.current) {
         observer.observe(containerRef.current)
      }

      return () => {
         observer.unobserve(currentContainerRef)
         clearTimeout(timeout)
      }
   }, [disableAutoPlay, isMobile])

   // Set up auto-playing timeout for mobile experience
   useEffect(() => {
      let timeout

      if (!disableAutoPlay && autoPlaying && isMobile) {
         // After auto-play we should transition to the next spark
         timeout = setTimeout(() => {
            setAutoPlaying(false)
            onGoNext && onGoNext()
         }, SPARK_CONSTANTS.SECONDS_TO_AUTO_PLAY)
      }

      return () => {
         clearTimeout(timeout)
      }
   }, [autoPlaying, disableAutoPlay, isMobile, onGoNext])

   return (
      <SparkPreviewCardContainer
         type={type}
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
            muted,
         }}
         onMouseEnter={
            disableAutoPlay || isMobile ? null : () => setAutoPlaying(true)
         }
         onMouseLeave={
            disableAutoPlay || isMobile ? null : () => setAutoPlaying(false)
         }
         onVideoEnded={onVideoEnded}
         autoPlaying={!disableAutoPlay && autoPlaying}
         containerRef={containerRef}
         selected={selected}
      >
         {selectInput || null}

         <Box px={cardPadding} pt={cardPadding}>
            <SparkHeader showAdminOptions={false} spark={spark} />
         </Box>
         <Stack
            sx={styles.cardDetails}
            p={cardPadding}
            onClick={() => onClick && onClick(spark)}
            flexGrow={1}
         >
            <SparkCategoryChip categoryId={spark.category.id} />
            <SparkQuestion
               question={spark.question}
               limitLines={questionLimitLines}
            />
         </Stack>
      </SparkPreviewCardContainer>
   )
}

export default SparkPreviewCard
