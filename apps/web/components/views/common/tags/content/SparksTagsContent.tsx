import {
   ContentTopicsTagValues,
   GroupedTags,
} from "@careerfairy/shared-lib/constants/tags"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Typography } from "@mui/material"
import { useSparksByTags } from "components/custom-hook/tags/useSparksByTags"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
import { useRouter } from "next/router"
import { sxStyles } from "types/commonTypes"

const SPARKS_PER_BATCH = 10

const styles = sxStyles({
   heading: {
      fontSize: "18px",
      fontWeight: 600,
   },
   carousel: {
      ml: "16px !important",
      mr: 4,
   },
   header: {
      mr: 2,
   },
})

type Props = {
   tags: GroupedTags
   selectedTagLabel: string
   selectTagIds: string[]
}

const SparksTagsContent = ({ tags, selectedTagLabel, selectTagIds }: Props) => {
   const router = useRouter()

   // No need to use setSize for next page, since the sparks to be fetched is
   // capped to 10 items.
   const { data: sparks } = useSparksByTags(tags, SPARKS_PER_BATCH)

   const handleSparksClicked = (spark: Spark) => {
      if (!spark) return

      return router.push({
         pathname: `/sparks/${spark.id}`,
         query: {
            ...router.query, // spread current query params
            interactionSource: SparkInteractionSources.PortalTag,
            contentTopic: selectTagIds.filter((id) => {
               return Boolean(
                  ContentTopicsTagValues.find((tag) => tag.id == id)
               )
            }),
         },
      })
   }

   if (!sparks.length) return null

   return (
      <SparksCarousel
         header={
            <Typography
               sx={styles.heading}
               color="neutral.800"
            >{`Sparks talking about ${selectedTagLabel}`}</Typography>
         }
         sparks={sparks}
         handleSparksClicked={handleSparksClicked}
         containerSx={styles.carousel}
         headerSx={styles.header}
      />
   )
}

export default SparksTagsContent
