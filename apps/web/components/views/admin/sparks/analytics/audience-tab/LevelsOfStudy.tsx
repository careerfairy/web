import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import { useGroup } from "layouts/GroupDashboardLayout"
import CFPieChart from "../components/charts/CFPieChart"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { EmptyDataCheckerForPieChart } from "./EmptyDataCheckers"

type LevelsOfStudyProps = {
   timeFilter: TimePeriodParams
}

export const LevelsOfStudy = ({ timeFilter }: LevelsOfStudyProps) => {
   const { group } = useGroup()
   const { levelsOfStudy } = useSparksAnalytics(group.id)[timeFilter]

   return (
      <GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainerTitle sx={{ marginBottom: 0 }}>
            Level of study
         </GroupSparkAnalyticsCardContainerTitle>
         <EmptyDataCheckerForPieChart>
            <CFPieChart data={levelsOfStudy} />
         </EmptyDataCheckerForPieChart>
      </GroupSparkAnalyticsCardContainer>
   )
}
