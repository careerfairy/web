import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { imageKitLoader } from "@careerfairy/shared-lib/utils/video"
import { Box, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSpark from "components/views/admin/sparks/analytics/competitor-tab/useSpark"
import SparkCategoryChip from "components/views/sparks/components/spark-card/SparkCategoryChip"
import SparkHeader from "components/views/sparks/components/spark-card/SparkHeader"
import SparkPreviewCardContainer from "components/views/sparks/components/spark-card/SparkPreviewCardContainer"
import SparkQuestion from "components/views/sparks/components/spark-card/SparkQuestion"
import { SparkComponentType } from "data/hygraph/types"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import { ExpandedSparkCard } from "./ExpandedSparkCard"
import { useHighlights } from "./HighlightsBlockContext"

const CARD_PADDING = 1.5

const styles = sxStyles({
   sparkContainer: {
      ".spark-preview-card-container": {
         width: {
            xs: "100%",
            md: 220,
         },
      },
   },
   cardDetails: {
      cursor: "pointer",
      justifyContent: "flex-end",
      gap: "6px",
   },
})

type SparkCardProps = {
   spark: SparkComponentType
   index: number
}

export const SparkCard = ({ spark, index }: SparkCardProps) => {
   const isMobile = useIsMobile()
   const sparkData = useSpark(spark.sparkId)
   const {
      shouldAutoPlay,
      isExpanded,
      handleExpandCardClick,
      handleCloseCardClick,
      setAutoPlayingIndex,
      isPlayingExpanded,
   } = useHighlights()

   const sparkPresenter = useMemo(() => {
      return SparkPresenter.createFromFirebaseObject(sparkData)
   }, [sparkData])

   if (!sparkData) return null

   return (
      <>
         <Box sx={styles.sparkContainer} onClick={handleExpandCardClick(index)}>
            <SparkPreviewCardContainer
               type="carousel"
               video={{
                  thumbnailUrl: sparkData.video.thumbnailUrl,
                  url: imageKitLoader({
                     src: sparkData.video.url,
                     height: 640 * 1,
                     width: 360 * 1,
                     quality: 40,
                     maxSizeCrop: true,
                  }),
                  preview: shouldAutoPlay(index),
                  muted: true,
               }}
               onMouseEnter={isMobile ? null : () => setAutoPlayingIndex(index)}
               onMouseLeave={
                  isMobile ? null : () => setAutoPlayingIndex(undefined)
               }
               autoPlaying={shouldAutoPlay(index)}
            >
               <Box px={CARD_PADDING} pt={CARD_PADDING}>
                  <SparkHeader showAdminOptions={false} spark={sparkData} />
               </Box>
               <Stack sx={styles.cardDetails} p={CARD_PADDING} flexGrow={1}>
                  <SparkCategoryChip categoryId={sparkData.category.id} />
                  <SparkQuestion question={sparkData.question} limitLines />
               </Stack>
            </SparkPreviewCardContainer>
         </Box>
         {isExpanded(index) && (
            <ExpandedSparkCard
               spark={sparkPresenter}
               playing={isPlayingExpanded}
               onClose={handleCloseCardClick}
            />
         )}
      </>
   )
}
