import { Box, Grid } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSparks from "components/custom-hook/spark/useSparks"
import SparksCarouselSkeleton from "components/views/admin/sparks/general-sparks-view/SparksCarouselSkeleton"
import SparkPreviewCard from "components/views/sparks/components/spark-card/SparkPreviewCard"
import { FC } from "react"

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
   return (
      <Grid container spacing={2}>
         {groupSparks?.map((spark) => (
            <Grid item key={spark.id} xs={6} sm={4} md={3}>
               <SparkPreviewCard
                  key={spark.id}
                  spark={spark}
                  questionLimitLines={true}
                  muted
               />
            </Grid>
         ))}
      </Grid>
   )
}

export default SparksTab
