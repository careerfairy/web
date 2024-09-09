import { SectionsWrapper } from "../components/SectionsWrapper"
import { CompetitorSkeleton } from "../overview-tab/SparksAnalyticsCompetitorTabSkeletons"
import { BannerForCompetitorTable } from "./banner-competitor-table/BannerForCompetitorTable"

export const SparksCompetitorTabSkeleton = () => {
   return (
      <SectionsWrapper>
         <CompetitorSkeleton />
         <CompetitorSkeleton />
         <BannerForCompetitorTable />
      </SectionsWrapper>
   )
}
