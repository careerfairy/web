import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Typography } from "@mui/material"
import { SparksCarouselWithArrows } from "components/views/portal/sparks/SparksCarouselWithArrows"
import { useRouter } from "next/router"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   heading: {
      fontSize: "18px",
      fontWeight: 600,
   },
})

type Props = {
   sparks: Spark[]
   selectedTagLabel: string
}

const SparksTagsContent = ({ sparks, selectedTagLabel }: Props) => {
   const router = useRouter()

   const handleSparksClicked = (spark: Spark) => {
      if (!spark) return

      return router.push({
         pathname: `/sparks/${spark.id}`,
         query: {
            ...router.query, // spread current query params
            interactionSource: SparkInteractionSources.PortalTag,
         },
      })
   }

   if (!sparks.length) return null

   return (
      <SparksCarouselWithArrows
         header={
            <Typography
               sx={styles.heading}
               color="neutral.800"
            >{`Sparks talking about ${selectedTagLabel}`}</Typography>
         }
         showArrows
         sparks={sparks}
         handleSparksClicked={handleSparksClicked}
      />
   )
}

export default SparksTagsContent
