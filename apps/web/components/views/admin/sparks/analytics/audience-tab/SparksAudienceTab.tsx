import { FC } from "react"
import { Grid } from "@mui/material"
import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { GroupSparkAnalyticsCardContainer } from "../components/GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../components/GroupSparkAnalyticsCardTitle"
import CFPieChart from "../components/charts/CFPieChart"
import { useGroup } from "layouts/GroupDashboardLayout"
import useSparksAnalytics from "components/custom-hook/spark/analytics/useSparksAnalytics"
import BulletChart from "../components/BulletChart"

type SparksAudienceTabProps = {
   timeFilter: TimePeriodParams
}

const SparksAudienceTab: FC<SparksAudienceTabProps> = ({ timeFilter }) => {
   const { group } = useGroup()
   const { topCountries, topUniversities, topFieldsOfStudy, levelsOfStudy } =
      useSparksAnalytics(group.id)[timeFilter]

   return (
      <Grid container spacing={5} marginBottom={10} alignItems="stretch">
         <Grid item xs={12} md={6}>
            <GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainerTitle>
                  Top 10 countries
               </GroupSparkAnalyticsCardContainerTitle>
               <BulletChart data={topCountries} />
            </GroupSparkAnalyticsCardContainer>
         </Grid>
         <Grid item xs={12} md={6}>
            <GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainerTitle>
                  Top 10 universities
               </GroupSparkAnalyticsCardContainerTitle>
               <BulletChart data={topUniversities} />
            </GroupSparkAnalyticsCardContainer>
         </Grid>
         <Grid item xs={12} md={6}>
            <GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainerTitle>
                  Top 10 fields of study
               </GroupSparkAnalyticsCardContainerTitle>
               <CFPieChart data={topFieldsOfStudy} />
            </GroupSparkAnalyticsCardContainer>
         </Grid>
         <Grid item xs={12} md={6}>
            <GroupSparkAnalyticsCardContainer>
               <GroupSparkAnalyticsCardContainerTitle>
                  Level of study
               </GroupSparkAnalyticsCardContainerTitle>
               <CFPieChart data={levelsOfStudy} />
            </GroupSparkAnalyticsCardContainer>
         </Grid>
      </Grid>
   )
}

export default SparksAudienceTab
