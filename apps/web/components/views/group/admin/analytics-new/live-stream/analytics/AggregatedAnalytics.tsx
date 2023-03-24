import React from "react"
import { Grid } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { useLivestreamsAnalyticsPageContext } from "../LivestreamAnalyticsPageProvider"
import {
   SimpleCardAnalytic,
   SimpleCardAnalyticSkeleton,
} from "../../../common/CardAnalytic"
import { useFirestoreDocument } from "../../../../../../custom-hook/utils/useFirestoreDocument"
import { LivestreamRecordingDetails } from "@careerfairy/shared-lib/livestreams"
import { SuspenseWithBoundary } from "../../../../../../ErrorBoundary"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const AggregatedAnalytics = () => {
   const { currentStreamStats, isOnDetailsPage } =
      useLivestreamsAnalyticsPageContext()

   // we don't fetch the document if we are not on the details page
   if (!isOnDetailsPage) return null

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

   const { data: recordingDetails } =
      useFirestoreDocument<LivestreamRecordingDetails>("livestreams", [
         currentStreamStats.livestream.id,
         "recordingStats",
         "stats",
      ])

   return (
      <SimpleCardAnalytic
         title="Recording views"
         value={recordingDetails?.views ?? 0}
      />
   )
}
export default AggregatedAnalytics
