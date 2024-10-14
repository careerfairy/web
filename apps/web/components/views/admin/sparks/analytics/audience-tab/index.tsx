import { Grid } from "@mui/material"
import { useAnalyticsLocking } from "components/custom-hook/spark/analytics/useAnalyticsLocking"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { LockedSparksAudienceTab } from "../components/locking/LockedSparksAudienceTab"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { LevelsOfStudy } from "./LevelsOfStudy"
import { SparksAudienceTabSkeleton } from "./SparksAudienceTabSkeleton"
import { TopCountries } from "./TopCountries"
import { TopFieldsOfStudy } from "./TopFieldsOfStudy"
import { TopUniversities } from "./TopUniversities"

export const SparksAudienceTab = () => {
   const { isLocked } = useAnalyticsLocking("audience")
   const { isLoading, isMutating } = useSparksAnalytics()

   if (isLocked) {
      return <LockedSparksAudienceTab />
   }

   if (isLoading && !isMutating) {
      return <SparksAudienceTabSkeleton />
   }

   return (
      <SuspenseWithBoundary fallback={<SparksAudienceTabSkeleton />}>
         <Grid container spacing={5} marginBottom={10} alignItems="stretch">
            <Grid item xs={12} md={6}>
               <TopCountries />
            </Grid>
            <Grid item xs={12} md={6}>
               <TopUniversities />
            </Grid>
            <Grid item xs={12} md={6}>
               <TopFieldsOfStudy />
            </Grid>
            <Grid item xs={12} md={6}>
               <LevelsOfStudy />
            </Grid>
         </Grid>
      </SuspenseWithBoundary>
   )
}
