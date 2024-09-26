import { SectionsWrapper } from "../components/SectionsWrapper"
import {
   EngagementAnalyticsSkeleton,
   MostSomethingSkeleton,
   ReachAnalyticsSkeleton,
} from "./SparksAnalyticsOverviewTabSkeletons"

export const SparksOverviewTabSkeleton = () => {
   return (
      <SectionsWrapper>
         <ReachAnalyticsSkeleton />
         <EngagementAnalyticsSkeleton />
         <MostSomethingSkeleton />
      </SectionsWrapper>
   )
}
