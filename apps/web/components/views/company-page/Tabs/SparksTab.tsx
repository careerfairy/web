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
import { setCameFromPageLink } from "store/reducers/sparksFeedReducer"

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
   const router = useRouter()
   const dispatch = useDispatch()

   const handleSparksClicked = useCallback(
      (spark: Spark) => {
         if (spark) {
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
         return
      },
      [dispatch, groupId, router]
   )

   return (
      <Grid
         container
         spacing={2}
         sx={{
            justifyContent: "center",
         }}
      >
         {groupSparks?.map((spark) => (
            <Grid item key={spark.id} xs={6} sm={4} md={4} lg={3}>
               <SparkPreviewCard
                  key={spark.id}
                  spark={spark}
                  questionLimitLines={true}
                  onClick={handleSparksClicked}
                  muted
                  type="gallery"
               />
            </Grid>
         ))}
      </Grid>
   )
}

export default SparksTab
