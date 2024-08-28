import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { useAnalyticsLocking } from "components/custom-hook/spark/analytics/useAnalyticsLocking"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { LockedSparksCompetitorTab } from "../components/locking/LockedSparksCompetitorTab"
import { SectionsWrapper } from "../components/SectionsWrapper"
import { CompetitorSkeleton } from "../overview-tab/SparksAnalyticsCompetitorTabSkeletons"
import { BannerForCompetitorTable } from "./banner-competitor-table/BannerForCompetitorTable"
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
      <SectionsWrapper>
         <SuspenseWithBoundary fallback={<CompetitorSkeleton />}>
            <TopSparksByIndustry timeFilter={timeFilter} />
         </SuspenseWithBoundary>
         <SuspenseWithBoundary fallback={<CompetitorSkeleton />}>
            <TopSparksByAudience timeFilter={timeFilter} />
         </SuspenseWithBoundary>
         <BannerForCompetitorTable />
      </SectionsWrapper>
   )
}
