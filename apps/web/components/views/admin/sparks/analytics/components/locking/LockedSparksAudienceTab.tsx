import { Grid } from "@mui/material"
import BulletChart from "../charts/BulletChart"
import CFPieChart from "../charts/CFPieChart"
import { GroupSparkAnalyticsCardContainer } from "../GroupSparkAnalyticsCardContainer"
import { GroupSparkAnalyticsCardContainerTitle } from "../GroupSparkAnalyticsCardTitle"
import { MockedData } from "./locked-mocked-data"
import { LockedComponentsModal } from "./LockedComponentsModal"
import { LockedContent } from "./LockedContent"

const metrics = ["Top countries", "Top universities", "Top field of studies"]

export const LockedSparksAudienceTab = () => {
   return (
      <>
         <LockedComponentsModal
            title="Unlock audience"
            text="Unlock in-depth audience insights"
            metrics={metrics}
         />
         <LockedContent>
            <Grid container spacing={5} marginBottom={10} alignItems="stretch">
               <Grid item xs={12} md={6}>
                  <GroupSparkAnalyticsCardContainer>
                     <GroupSparkAnalyticsCardContainerTitle>
                        Top 10 countries
                     </GroupSparkAnalyticsCardContainerTitle>
                     <BulletChart
                        data={MockedData.audience.top10Countries}
                        valueIndexer="relativePercentage"
                     />
                  </GroupSparkAnalyticsCardContainer>
               </Grid>
               <Grid item xs={12} md={6}>
                  <GroupSparkAnalyticsCardContainer>
                     <GroupSparkAnalyticsCardContainerTitle>
                        Top 10 universities
                     </GroupSparkAnalyticsCardContainerTitle>
                     <BulletChart
                        data={MockedData.audience.top10Universities}
                        valueIndexer="relativePercentage"
                        showPercentageOnly
                     />
                  </GroupSparkAnalyticsCardContainer>
               </Grid>
               <Grid item xs={12} md={6}>
                  <GroupSparkAnalyticsCardContainer>
                     <GroupSparkAnalyticsCardContainerTitle
                        sx={{ marginBottom: 0 }}
                     >
                        Top 10 fields of study
                     </GroupSparkAnalyticsCardContainerTitle>
                     <CFPieChart
                        data={MockedData.audience.top10FieldsOfStudy}
                     />
                  </GroupSparkAnalyticsCardContainer>
               </Grid>
               <Grid item xs={12} md={6}>
                  <GroupSparkAnalyticsCardContainer>
                     <GroupSparkAnalyticsCardContainerTitle
                        sx={{ marginBottom: 0 }}
                     >
                        Level of study
                     </GroupSparkAnalyticsCardContainerTitle>
                     <CFPieChart data={MockedData.audience.levelsOfStudy} />
                  </GroupSparkAnalyticsCardContainer>
               </Grid>
            </Grid>
         </LockedContent>
      </>
   )
}
