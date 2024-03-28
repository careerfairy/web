import { FC, useEffect, useState } from "react"
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
import { useInView } from "react-intersection-observer"

const cardPadding = 2
export const AUTO_PLAY_TIME = 5000

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
   mobileActiveSpark?: boolean
}

const SparkCarouselCard: FC<Props> = ({
   spark,
   onClick,
   preview = false,
   onGoNext,
   mobileActiveSpark,
}) => {
   const sparkPresenter = SparkPresenter.createFromFirebaseObject(spark)
   const [autoPlaying, setAutoPlaying] = useState(false)
   const isMobile = useIsMobile()
   const [inViewRef, inView] = useInView({ threshold: 1 })

   // Set up intersection observer to handle auto-playing only when the card is visible
   useEffect(() => {
      let timeout
      if (inView && mobileActiveSpark) {
         timeout = setTimeout(() => {
            setAutoPlaying(true)
         }, 1000)
      } else {
         setAutoPlaying(false)
         clearTimeout(timeout)
      }

      return () => {
         clearTimeout(timeout)
      }
   }, [inView, mobileActiveSpark])

   // Set up auto-playing timeout for mobile experience
   useEffect(() => {
      let timeout

      if (autoPlaying && isMobile) {
         // After auto-play we should transition to the next spark
         timeout = setTimeout(() => {
            setAutoPlaying(false)
            onGoNext && onGoNext()
         }, AUTO_PLAY_TIME)
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
         containerRef={inViewRef}
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
