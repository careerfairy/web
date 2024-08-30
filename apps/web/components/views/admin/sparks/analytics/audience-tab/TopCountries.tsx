import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import { useGroup } from "layouts/GroupDashboardLayout"
import BulletChart from "../components/charts/BulletChart"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { EmptyDataCheckerForBulletChart } from "./EmptyDataCheckers"
import { updateRelativePercentage, valueIllusionMargin } from "./utils"

type TopCountriesProps = {
   timeFilter: TimePeriodParams
}

export const TopCountries = ({ timeFilter }: TopCountriesProps) => {
   const { group } = useGroup()
   const { topCountries } = useSparksAnalytics(group.id)[timeFilter]

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
