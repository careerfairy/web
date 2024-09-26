import CFPieChart from "../components/charts/CFPieChart"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { EmptyDataCheckerForPieChart } from "./EmptyDataCheckers"

export const LevelsOfStudy = () => {
   const {
      filteredAnalytics: { levelsOfStudy },
   } = useSparksAnalytics()

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
