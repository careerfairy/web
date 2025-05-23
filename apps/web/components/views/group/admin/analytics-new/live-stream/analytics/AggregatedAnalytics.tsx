import { Grid } from "@mui/material"
import { useRecordingViewsSWR } from "components/custom-hook/recordings/useRecordingViewsSWR"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../../../../ErrorBoundary"
import {
   SimpleCardAnalytic,
   SimpleCardAnalyticSkeleton,
} from "../../../common/CardAnalytic"
import { useLivestreamsAnalyticsPageContext } from "../LivestreamAnalyticsPageProvider"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const AggregatedAnalytics = () => {
   const { currentStreamStats } = useLivestreamsAnalyticsPageContext()

   if (!currentStreamStats) return <LoadingAggregatedAnalytics />

   return (
      <Grid container spacing={3}>
         <Grid xs={12} sm={6} md={4} item style={styles.gridItem}>
            <SimpleCardAnalytic
               title="Registrations"
               value={
                  currentStreamStats?.generalStats?.numberOfRegistrations ?? 0
               }
            />
         </Grid>
         <Grid xs={12} sm={6} md={4} item style={styles.gridItem}>
            <SimpleCardAnalytic
               title="Participants"
               value={
                  currentStreamStats?.generalStats?.numberOfParticipants ?? 0
               }
            />
         </Grid>
         <Grid xs={12} sm={12} md={4} item style={styles.gridItem}>
            <SuspenseWithBoundary fallback={<SimpleCardAnalyticSkeleton />}>
               <RecordingViewsAnalytic />
            </SuspenseWithBoundary>
         </Grid>
      </Grid>
   )
}

const LoadingAggregatedAnalytics = () => {
   return (
      <Grid container spacing={3}>
         <Grid xs={12} sm={6} md={4} item style={styles.gridItem}>
            <SimpleCardAnalyticSkeleton />
         </Grid>
         <Grid xs={12} sm={6} md={4} item style={styles.gridItem}>
            <SimpleCardAnalyticSkeleton />
         </Grid>
         <Grid xs={12} sm={12} md={4} item style={styles.gridItem}>
            <SimpleCardAnalyticSkeleton />
         </Grid>
      </Grid>
   )
}

const RecordingViewsAnalytic = () => {
   const { currentStreamStats } = useLivestreamsAnalyticsPageContext()
   const { totalViews, loading } = useRecordingViewsSWR(
      currentStreamStats.livestream.id
   )

   return (
      <SimpleCardAnalytic
         title="Recording views"
         value={totalViews ?? 0}
         isLoading={loading}
      />
   )
}

export default AggregatedAnalytics
