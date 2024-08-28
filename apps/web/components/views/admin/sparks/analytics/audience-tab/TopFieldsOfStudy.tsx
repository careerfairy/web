import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import { useGroup } from "layouts/GroupDashboardLayout"
import CFPieChart from "../components/charts/CFPieChart"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { EmptyDataCheckerForPieChart } from "./EmptyDataCheckers"

type TopFieldsOfStudyProps = {
   timeFilter: TimePeriodParams
}

export const TopFieldsOfStudy = ({ timeFilter }: TopFieldsOfStudyProps) => {
   const { group } = useGroup()
   const { topFieldsOfStudy } = useSparksAnalytics(group.id)[timeFilter]

   return (
      <GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainerTitle sx={{ marginBottom: 0 }}>
            Top 10 fields of study
         </GroupSparkAnalyticsCardContainerTitle>
         <EmptyDataCheckerForPieChart>
            <CFPieChart data={topFieldsOfStudy} />
         </EmptyDataCheckerForPieChart>
      </GroupSparkAnalyticsCardContainer>
   )
}
