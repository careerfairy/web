import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Box, Grid } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSparks from "components/custom-hook/spark/useSparks"
import SparksCarouselSkeleton from "components/views/admin/sparks/general-sparks-view/SparksCarouselSkeleton"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import { useRouter } from "next/router"
import { FC, useCallback } from "react"
import { useDispatch } from "react-redux"
import { setSparkToPreview } from "store/reducers/adminSparksReducer"
import { setCameFromPageLink } from "store/reducers/sparksFeedReducer"
import { useCompanyPage } from ".."

type Props = {
   groupId: string
}

const SparksTab: FC<Props> = ({ groupId }) => {
   return (
      <Box>
         <SuspenseWithBoundary fallback={<SparksCarouselSkeleton />}>
            <SparksGrid groupId={groupId} />
         </SuspenseWithBoundary>
      </Box>
   )
}

type SparksGridProps = {
   groupId: string
}
const SparksGrid = ({ groupId }: SparksGridProps) => {
   const { data: groupSparks } = useSparks({
      groupId,
   })
   const { tabMode } = useCompanyPage()
   const router = useRouter()
   const dispatch = useDispatch()

   const handleTabModeSparkClick = useCallback(
      (spark: Spark) => {
         dispatch(setSparkToPreview(spark.id))
      },
      [dispatch]
   )
   const handleSparksClicked = useCallback(
      (spark: Spark) => {
         if (spark) {
            if (tabMode) {
               handleTabModeSparkClick(spark)
            } else {
               dispatch(setCameFromPageLink(router.asPath))
               router.push({
                  pathname: `/sparks/${spark.id}`,
                  query: {
                     ...router.query, // spread current query params
                     groupId: groupId,
                     interactionSource: SparkInteractionSources.Company_Page,
                  },
               })
            }
         }
         return
      },
      [dispatch, groupId, router, tabMode, handleTabModeSparkClick]
   )

   return (
      <Box
         sx={{
            width: "100%",
            margin: "0 auto",
            maxWidth: "100%",
         }}
      >
         <Grid
            container
            spacing={2}
            sx={{
               display: "grid",
               gridTemplateColumns: "repeat(auto-fill, minmax(167px, 1fr))",
               gap: 2,
               width: "100%",
               margin: "0 auto",
               padding: 0,
            }}
         >
            {groupSparks?.map((spark) => (
               <Box key={spark.id} sx={{ width: "100%" }}>
                  <SparkPreviewCard
                     key={spark.id}
                     spark={spark}
                     questionLimitLines={true}
                     onClick={handleSparksClicked}
                     muted
                     type="gallery"
                  />
               </Box>
            ))}
         </Grid>
      </Box>
   )
}

export default SparksTab
