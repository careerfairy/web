import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Box } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useSpark from "components/views/admin/sparks/analytics/competitor-tab/useSpark"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import { SparkComponentType } from "data/hygraph/types"
import { useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import { ExpandedSparkCard } from "./ExpandedSparkCard"
import { useHighlights } from "./HighlightsBlockContext"

const styles = sxStyles({
   sparkContainer: {
      ".spark-preview-card-container": {
         width: {
            xs: "100%",
            md: 220,
         },
      },
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
      isPlayingExpanded,
   } = useHighlights()

   const sparkPresenter = useMemo(() => {
      return SparkPresenter.createFromFirebaseObject(sparkData)
   }, [sparkData])

   if (!sparkData) return null

   return (
      <>
         <Box sx={styles.sparkContainer} onClick={handleExpandCardClick(index)}>
            <SparkPreviewCard
               spark={sparkData}
               preview={shouldAutoPlay(index)}
               disableAutoPlay={isMobile}
               questionLimitLines
               muted
            />
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
