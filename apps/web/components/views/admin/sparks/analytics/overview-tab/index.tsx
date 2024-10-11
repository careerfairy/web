import { useAnalyticsLocking } from "components/custom-hook/spark/analytics/useAnalyticsLocking"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { LockedSparksAnalytics } from "../components/locking/LockedSparksAnalytics"
import { SectionsWrapper } from "../components/SectionsWrapper"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { EngagementAnalyticsContainer } from "./EngagementAnalyticsContainer"
import { MostSomethingAnalyticsContainer } from "./MostSomethingAnalyticsContainer"
import { ReachAnalyticsContainer } from "./ReachAnalyticsContainer"
import { SparksOverviewTabSkeleton } from "./SparksOverviewTabSkeleton"

export const SparksOverviewTab = () => {
   const { isLocked } = useAnalyticsLocking("overview")
   const { isLoading, isMutating } = useSparksAnalytics()

   if (isLocked) {
      return <LockedSparksAnalytics />
   }

   if (isLoading && !isMutating) {
      return <SparksOverviewTabSkeleton />
   }

   return (
      <SuspenseWithBoundary fallback={<SparksOverviewTabSkeleton />}>
         <SectionsWrapper>
            <ReachAnalyticsContainer />
            <EngagementAnalyticsContainer />
            <MostSomethingAnalyticsContainer />
         </SectionsWrapper>
      </SuspenseWithBoundary>
   )
}
