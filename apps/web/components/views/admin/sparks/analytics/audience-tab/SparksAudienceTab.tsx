import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { Grid } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC } from "react"
import BulletChart from "../components/BulletChart"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import { LockedSparksAudienceTab } from "../components/LockedSparksAudienceTab"
import CFPieChart from "../components/charts/CFPieChart"
import {
   EmptyDataCheckerForBulletChart,
   EmptyDataCheckerForPieChart,
} from "./EmptyDataCheckers"

const updateRelativePercentage = (data, maxValue) => {
   return data.map((item) => ({
      ...item,
      relativePercentage: (item.value / maxValue) * 100,
   }))
}

type SparksAudienceTabProps = {
   timeFilter: TimePeriodParams
}

const SparksAudienceTab: FC<SparksAudienceTabProps> = ({ timeFilter }) => {
   const { userData } = useAuth()
   const { group } = useGroup()
   const planStatus = useGroupPlanIsValid(group.groupId, [
      GroupPlanTypes.Tier2,
      GroupPlanTypes.Tier3,
   ])

   const { topCountries, topUniversities, topFieldsOfStudy, levelsOfStudy } =
      useSparksAnalytics(group.id)[timeFilter]

   const shouldLockAudiences = !userData.isAdmin && !planStatus.valid
   /*
    * The calculations below scale the bars' values relative to the maximum
    * absolute value of the dataset. This creates a better user experience
    * by giving the impression that the bars are larger. Using raw percentages
    * would make the bars appear consistently small.
    *
    * @valueIllusionMargin ensures that the first bar (i.e. maximum absolute value)
    * does not occupy the entire space, preventing it from being 100%.
    */
   const valueIllusionMargin = 1.075

   const maxCountryValue =
      Math.max(...topCountries.map((country) => country.value)) *
      valueIllusionMargin
   const maxUniversityValue =
      Math.max(...topUniversities.map((university) => university.value)) *
      valueIllusionMargin

   const updatedTopCountries = updateRelativePercentage(
      topCountries,
      maxCountryValue
   )
   const updatedTopUniversities = updateRelativePercentage(
      topUniversities,
      maxUniversityValue
   )

   if (shouldLockAudiences) {
      return <LockedSparksAudienceTab />
   }
   return (
      <Grid container spacing={5} marginBottom={10} alignItems="stretch">
         <Grid item xs={12} md={6}>
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
         </Grid>
         <Grid item xs={12} md={6}>
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
         </Grid>
         <Grid item xs={12} md={6}>
            <GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainerTitle sx={{ marginBottom: 0 }}>
                  Top 10 fields of study
               </GroupSparkAnalyticsCardContainerTitle>
               <EmptyDataCheckerForPieChart>
                  <CFPieChart data={topFieldsOfStudy} />
               </EmptyDataCheckerForPieChart>
            </GroupSparkAnalyticsCardContainer>
         </Grid>
         <Grid item xs={12} md={6}>
            <GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainerTitle sx={{ marginBottom: 0 }}>
                  Level of study
               </GroupSparkAnalyticsCardContainerTitle>
               <EmptyDataCheckerForPieChart>
                  <CFPieChart data={levelsOfStudy} />
               </EmptyDataCheckerForPieChart>
            </GroupSparkAnalyticsCardContainer>
         </Grid>
      </Grid>
   )
}

export default SparksAudienceTab
