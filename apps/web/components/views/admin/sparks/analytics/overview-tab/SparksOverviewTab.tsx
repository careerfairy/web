import { FC } from "react"
import { Stack } from "@mui/material"
import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import ReachAnalyticsContainer from "./ReachAnalyticsContainer"
import EngagementAnalyticsContainer from "./EngagementAnalyticsContainer"
import MostSomethingAnalyticsContainer from "./MostSomethingAnalyticsContainer"
import { timeFrameLabels } from "../util"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import {
   EngagementAnalyticsSkeleton,
   MostSomethingSkeleton,
   ReachAnalyticsSkeleton,
} from "./SparksAnalyticsOverviewTabSkeletons"

type SparksOverviewTabProps = {
   timeFilter: TimePeriodParams
}

const SparksOverviewTab: FC<SparksOverviewTabProps> = ({ timeFilter }) => {
   return (
      <Stack spacing={5} marginBottom={10}>
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
      </Stack>
   )
}

export default SparksOverviewTab
