import { Grid } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { AggregatedTalentPoolValue } from "./AggregatedTalentPoolValue"
import AverageRegistrationsValue from "./AverageRegistrationsValue"
import {
   ATSCard,
   AverageRegistrationsPerStreamCard,
   CardAnalytic,
   TalentPoolCard,
} from "../../common/CardAnalytic"
import { sxStyles } from "../../../../../../types/commonTypes"
import { totalPeopleReached } from "../../common/util"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})

const AggregatedAnalytics = () => {
   const { group, stats } = useGroup()

   return (
      <Grid container spacing={2}>
         <Grid item xs={6} style={styles.gridItem}>
            <CardAnalytic
               title="Talent reached"
               tooltip="Total number of talent exposed to your company"
               value={totalPeopleReached(stats)}
            />
         </Grid>

         <Grid item xs={6} style={styles.gridItem}>
            <CardAnalytic
               title="Total registrations"
               tooltip="Total number of registrations to all your streams"
               value={stats?.generalStats?.numberOfRegistrations ?? 0}
            />
         </Grid>

         <Grid item xs={6} style={styles.gridItem}>
            {group.atsAdminPageFlag ? (
               <ATSCard
                  value={stats?.generalStats?.numberOfApplications ?? 0}
               />
            ) : (
               <AverageRegistrationsPerStreamCard
                  value={<AverageRegistrationsValue />}
               />
            )}
         </Grid>

         <Grid item xs={6} style={styles.gridItem}>
            <TalentPoolCard value={<AggregatedTalentPoolValue />} />
         </Grid>
      </Grid>
   )
}

export default AggregatedAnalytics
