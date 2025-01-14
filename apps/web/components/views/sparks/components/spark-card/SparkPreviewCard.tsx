import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { imageKitLoader } from "@careerfairy/shared-lib/utils/video"
import { Stack } from "@mui/material"
import Box from "@mui/material/Box"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FC, useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
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

   const { ref, inView } = useInView({
      threshold: 0.9,
      skip: disableAutoPlay,
   })
   const isMobile = useIsMobile()

   /**
    * Auto-plays Spark preview cards on mobile when they become visible.
    * Uses intersection observer to detect when card is 90% in viewport.
    *
    * Flow:
    * 1. Card enters view -> Start playing after 200ms delay
    * 2. Card exits view -> Stop playing
    * 3. After auto-play duration -> Go to next Spark
    *
    * @param disableAutoPlay - Disables auto-play if true
    * @param isMobile - Is mobile device
    * @param inView - Is card visible
    * @param onGoNext - Handler for going to next Spark
    */
   useEffect(() => {
      if (disableAutoPlay) return

      let timeout: NodeJS.Timeout

      if (isMobile && inView) {
         timeout = setTimeout(() => {
            setAutoPlaying(true)
         }, 200)
      } else if (!inView) {
         setAutoPlaying(false)
      }

      return () => clearTimeout(timeout)
   }, [disableAutoPlay, isMobile, inView])

   // Set up auto-playing timeout for mobile experience
   useEffect(() => {
      if (disableAutoPlay) return

      let timeout: NodeJS.Timeout

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
         containerRef={ref}
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
