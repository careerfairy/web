import { SectionsWrapper } from "../components/SectionsWrapper"
import {
   CompetitorSparksCarouselSkeleton,
   CompetitorTableSkeleton,
} from "./SparksAnalyticsCompetitorTabSkeletons"

export const SparksCompetitorTabSkeleton = () => {
   return (
      <SectionsWrapper>
         <CompetitorTableSkeleton />
         <CompetitorSparksCarouselSkeleton />
         <CompetitorSparksCarouselSkeleton />
      </SectionsWrapper>
   )
}
