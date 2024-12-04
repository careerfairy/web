import BulletChart from "../components/charts/BulletChart"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { EmptyDataCheckerForBulletChart } from "./EmptyDataCheckers"
import { updateRelativePercentage, valueIllusionMargin } from "./utils"

export const TopUniversities = () => {
   const {
      filteredAnalytics: { topUniversities },
   } = useSparksAnalytics()

   const maxUniversityValue =
      Math.max(...topUniversities.map((university) => university.value)) *
      valueIllusionMargin

   const updatedTopUniversities = updateRelativePercentage(
      topUniversities,
      maxUniversityValue
   )

   return (
      <GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainerTitle>
            Top 10 universities
         </GroupSparkAnalyticsCardContainerTitle>
         <EmptyDataCheckerForBulletChart>
            <BulletChart
               data={updatedTopUniversities}
               valueIndexer="relativePercentage"
               showPercentageOnly
            />
         </EmptyDataCheckerForBulletChart>
      </GroupSparkAnalyticsCardContainer>
   )
}
