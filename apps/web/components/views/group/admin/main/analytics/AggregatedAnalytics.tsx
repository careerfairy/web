import { Grid } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import { AggregatedTalentPoolValue } from "./AggregatedTalentPoolValue"
import AverageRegistrationsValue from "./AverageRegistrationsValue"
import { ATSCard, CardAnalytic } from "../../common/CardAnalytic"
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
               <CardAnalytic
                  title="Average registrations per stream"
                  value={<AverageRegistrationsValue />}
               />
            )}
         </Grid>

         <Grid item xs={6} style={styles.gridItem}>
            <CardAnalytic
               title="Talent pool profiles"
               value={<AggregatedTalentPoolValue />}
               linkDescription={"Go to talent"}
               link={`/group/${group.id}/admin/analytics?section=1`}
            />
         </Grid>
      </Grid>
   )
}

export default AggregatedAnalytics
