import BulletChart from "../components/charts/BulletChart"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { useSparksAnalytics } from "../SparksAnalyticsContext"
import { EmptyDataCheckerForBulletChart } from "./EmptyDataCheckers"
import { updateRelativePercentage, valueIllusionMargin } from "./utils"

export const TopCountries = () => {
   const {
      filteredAnalytics: { topCountries },
   } = useSparksAnalytics()

   const maxCountryValue =
      Math.max(...topCountries.map((country) => country.value)) *
      valueIllusionMargin

   const updatedTopCountries = updateRelativePercentage(
      topCountries,
      maxCountryValue
   )

   return (
      <GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainerTitle>
            Top 10 countries
         </GroupSparkAnalyticsCardContainerTitle>
         <EmptyDataCheckerForBulletChart>
            <BulletChart
               data={updatedTopCountries}
               valueIndexer="relativePercentage"
            />
         </EmptyDataCheckerForBulletChart>
      </GroupSparkAnalyticsCardContainer>
   )
}
