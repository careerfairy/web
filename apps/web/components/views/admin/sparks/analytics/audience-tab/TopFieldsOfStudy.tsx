import CFPieChart from "../components/charts/CFPieChart"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { EmptyDataCheckerForPieChart } from "./EmptyDataCheckers"

export const TopFieldsOfStudy = () => {
   const {
      filteredAnalytics: { topFieldsOfStudy },
   } = useSparksAnalytics()

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
