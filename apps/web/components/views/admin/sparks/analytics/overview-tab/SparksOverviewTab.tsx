import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { useAnalyticsLocking } from "components/custom-hook/spark/analytics/useAnalyticsLocking"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { FC } from "react"
import { LockedSparksAnalytics } from "../components/locking/LockedSparksAnalytics"
import { SectionsWrapper } from "../components/SectionsWrapper"
import { timeFrameLabels } from "../util"
import EngagementAnalyticsContainer from "./EngagementAnalyticsContainer"
import MostSomethingAnalyticsContainer from "./MostSomethingAnalyticsContainer"
import ReachAnalyticsContainer from "./ReachAnalyticsContainer"
import {
   EngagementAnalyticsSkeleton,
   MostSomethingSkeleton,
   ReachAnalyticsSkeleton,
} from "./SparksAnalyticsOverviewTabSkeletons"

type SparksOverviewTabProps = {
   timeFilter: TimePeriodParams
}

const SparksOverviewTab: FC<SparksOverviewTabProps> = ({ timeFilter }) => {
   const { isLocked } = useAnalyticsLocking("overview")

   if (isLocked) {
      return <LockedSparksAnalytics />
   }

   return (
      <SectionsWrapper>
         <SuspenseWithBoundary fallback={<ReachAnalyticsSkeleton />}>
            <ReachAnalyticsContainer
               timeFilter={timeFilter}
               timeFrameLabel={timeFrameLabels[timeFilter]}
            />
         </SuspenseWithBoundary>
         <SuspenseWithBoundary fallback={<EngagementAnalyticsSkeleton />}>
            <EngagementAnalyticsContainer
               timeFilter={timeFilter}
               timeFrameLabel={timeFrameLabels[timeFilter]}
            />
         </SuspenseWithBoundary>
         <SuspenseWithBoundary fallback={<MostSomethingSkeleton />}>
            <MostSomethingAnalyticsContainer timeFilter={timeFilter} />
         </SuspenseWithBoundary>
      </SectionsWrapper>
   )
}

export default SparksOverviewTab
