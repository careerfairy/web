import { useAnalyticsLocking } from "components/custom-hook/spark/analytics/useAnalyticsLocking"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { LockedSparksCompetitorTab } from "../components/locking/LockedSparksCompetitorTab"
import { SectionsWrapper } from "../components/SectionsWrapper"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { SparksCompetitorTabSkeleton } from "./SparksCompetitorTabSkeleton"
import { TopCompaniesByIndustry } from "./TopCompaniesByIndustry"
import { TopSparksByAudience } from "./TopSparksByAudience"
import { TopSparksByIndustry } from "./TopSparksByIndustry"

export const SparksCompetitorTab = () => {
   const { isLocked } = useAnalyticsLocking("competitor")
   const { isLoading, isMutating } = useSparksAnalytics()

   if (isLocked) {
      return <LockedSparksCompetitorTab />
   }

   if (isLoading && !isMutating) {
      return <SparksCompetitorTabSkeleton />
   }

   return (
      <SuspenseWithBoundary fallback={<SparksCompetitorTabSkeleton />}>
         <SectionsWrapper>
            <TopCompaniesByIndustry />
            <TopSparksByIndustry />
            <TopSparksByAudience />
         </SectionsWrapper>
      </SuspenseWithBoundary>
   )
}
