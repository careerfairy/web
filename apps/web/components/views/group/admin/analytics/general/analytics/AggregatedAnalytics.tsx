import React from "react"
import { Grid } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { CardAnalytic } from "../../../common/CardAnalytic"
import { totalPeopleReached } from "../../../common/util"
import { useAnalyticsPageContext } from "../../AnalyticsPageProvider"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
})
const AggregatedAnalytics = () => {
   const { groupPresenter, group, stats } = useGroup()
   const { livestreamStats } = useAnalyticsPageContext()

   const hasAts = groupPresenter.atsAccounts?.length > 0
   const companyPageReady = groupPresenter.companyPageIsReady()

   return (
      <Grid container spacing={3}>
         {companyPageReady ? (
            <>
               <Grid xs={6} item style={styles.gridItem}>
                  {/*Render Company Page Views*/}
                  <CardAnalytic
                     title="Company Views"
                     tooltip="Total number of people exposed to your company"
                     value={totalPeopleReached(stats)}
                  />
               </Grid>
               <Grid xs={6} item style={styles.gridItem}>
                  {/*Get number by doing a count query on the collection group companiesUserFollows, where groupId === current groupId*/}
                  <CardAnalytic
                     title="Followers"
                     tooltip="Total number of people who follow your company"
                     value={-1}
                  />
               </Grid>
            </>
         ) : null}
         {hasAts ? (
            <>
               <Grid xs={6} item style={styles.gridItem}>
                  {/*Get number by reducing the streamStats.numberOfTalentPoolProfiles*/}
                  <CardAnalytic
                     title="Talent Pool"
                     value={-1}
                     linkDescription={"Go to talents"}
                     link={`/group/${group.id}/admin/analytics/talent-pool?section=1`} // Should go to
                  />
               </Grid>
               <Grid xs={6} item style={styles.gridItem}>
                  {/*Get number from reducing the streamStats.numberOfApplications*/}
                  <CardAnalytic
                     title="Total applications"
                     value={-1}
                     linkDescription={"Go to applicants"}
                     link={`/group/${group.id}/admin/ats-integration?section=1`}
                  />
               </Grid>
            </>
         ) : (
            <>
               <Grid xs={6} item style={styles.gridItem}>
                  {/*Get number by reducing streamStats.numberOfPeopleReached*/}
                  <CardAnalytic title="Young talent reached" value={-1} />
               </Grid>
               <Grid xs={6} item style={styles.gridItem}>
                  {/*Get number by reducing the streamStats.numberOfRegistrations and dividing the sum by number of stream stats */}
                  <CardAnalytic
                     title="Average registrations per stream"
                     value={-1}
                  />
               </Grid>
            </>
         )}
      </Grid>
   )
}

export default AggregatedAnalytics
