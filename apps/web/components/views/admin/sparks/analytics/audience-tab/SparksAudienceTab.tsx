import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { Grid } from "@mui/material"
import { useAnalyticsLocking } from "components/custom-hook/spark/analytics/useAnalyticsLocking"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { LockedSparksAudienceTab } from "../components/locking/LockedSparksAudienceTab"
import { LevelsOfStudy } from "./LevelsOfStudy"
import { PieChartsSkeleton, TopBulletChartsSkeleton } from "./Skeletons"
import { TopCountries } from "./TopCountries"
import { TopFieldsOfStudy } from "./TopFieldsOfStudy"
import { TopUniversities } from "./TopUniversities"

type SparksAudienceTabProps = {
   timeFilter: TimePeriodParams
}

const SparksAudienceTab = ({ timeFilter }: SparksAudienceTabProps) => {
   const { isLocked } = useAnalyticsLocking("audience")

   if (isLocked) {
      return <LockedSparksAudienceTab />
   }

   return (
      <Grid container spacing={5} marginBottom={10} alignItems="stretch">
         <Grid item xs={12} md={6}>
            <SuspenseWithBoundary fallback={<TopBulletChartsSkeleton />}>
               <TopCountries timeFilter={timeFilter} />
            </SuspenseWithBoundary>
         </Grid>
         <Grid item xs={12} md={6}>
            <SuspenseWithBoundary fallback={<TopBulletChartsSkeleton />}>
               <TopUniversities timeFilter={timeFilter} />
            </SuspenseWithBoundary>
         </Grid>
         <Grid item xs={12} md={6}>
            <SuspenseWithBoundary fallback={<PieChartsSkeleton />}>
               <TopFieldsOfStudy timeFilter={timeFilter} />
            </SuspenseWithBoundary>
         </Grid>
         <Grid item xs={12} md={6}>
            <SuspenseWithBoundary fallback={<PieChartsSkeleton />}>
               <LevelsOfStudy timeFilter={timeFilter} />
            </SuspenseWithBoundary>
         </Grid>
      </Grid>
   )
}

export default SparksAudienceTab
