import { Box } from "@mui/material"
import useSpark from "components/views/admin/sparks/analytics/competitor-tab/useSpark"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import { SparkComponentType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"
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
   const sparkData = useSpark(spark.sparkId)
   const { shouldAutoPlay } = useHighlights()

   if (!sparkData) return null

   return (
      <Box sx={styles.sparkContainer}>
         <SparkPreviewCard
            spark={sparkData}
            onClick={() => alert("Wololo. Will do something in the future.")}
            preview={shouldAutoPlay(index)}
            disableAutoPlay={false}
            questionLimitLines={true}
         />
      </Box>
   )
}
