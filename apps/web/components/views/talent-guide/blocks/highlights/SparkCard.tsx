import { Box } from "@mui/material"
import useSpark from "components/views/admin/sparks/analytics/competitor-tab/useSpark"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import { SparkComponentType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   sparkContainer: {
      ".spark-preview-card-container": {
         width: {
            xs: 168,
            md: 220,
         },
      },
   },
})

export const SparkCard = ({
   spark,
   isPlaying,
}: {
   spark: SparkComponentType
   isPlaying: boolean
}) => {
   const sparkData = useSpark(spark.sparkId)

   if (!sparkData) return null

   return (
      <Box sx={styles.sparkContainer}>
         <SparkPreviewCard
            spark={sparkData}
            onClick={() => alert("Wololo. Will do something in the future.")}
            preview={isPlaying}
            disableAutoPlay={false}
         />
      </Box>
   )
}
