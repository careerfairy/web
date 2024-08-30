import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import { useGroup } from "layouts/GroupDashboardLayout"
import BulletChart from "../components/charts/BulletChart"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { EmptyDataCheckerForBulletChart } from "./EmptyDataCheckers"
import { updateRelativePercentage, valueIllusionMargin } from "./utils"

type TopUniversitiesProps = {
   timeFilter: TimePeriodParams
}

export const TopUniversities = ({ timeFilter }: TopUniversitiesProps) => {
   const { group } = useGroup()
   const { topUniversities } = useSparksAnalytics(group.id)[timeFilter]

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
            />
         </EmptyDataCheckerForBulletChart>
      </GroupSparkAnalyticsCardContainer>
   )
}
