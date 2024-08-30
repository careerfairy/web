import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { Stack } from "@mui/material"
import { useAnalyticsLocking } from "components/custom-hook/spark/analytics/useAnalyticsLocking"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { LockedSparksCompetitorTab } from "../components/locking/LockedSparksCompetitorTab"
import { MostSomethingSkeleton } from "../overview-tab/SparksAnalyticsOverviewTabSkeletons"
import { TopSparksByAudience } from "./TopSparksByAudience"
import { TopSparksByIndustry } from "./TopSparksByIndustry"

type SparksCompetitorTabProps = {
   timeFilter: TimePeriodParams
}

export const SparksCompetitorTab = ({
   timeFilter,
}: SparksCompetitorTabProps) => {
   const { isLocked } = useAnalyticsLocking("competitor")

   if (isLocked) {
      return <LockedSparksCompetitorTab />
   }

   return (
      <Stack spacing={5} marginBottom={10}>
         <SuspenseWithBoundary fallback={<MostSomethingSkeleton />}>
            <TopSparksByIndustry timeFilter={timeFilter} />
         </SuspenseWithBoundary>
         <SuspenseWithBoundary fallback={<MostSomethingSkeleton />}>
            <TopSparksByAudience timeFilter={timeFilter} />
         </SuspenseWithBoundary>
      </Stack>
   )
}
