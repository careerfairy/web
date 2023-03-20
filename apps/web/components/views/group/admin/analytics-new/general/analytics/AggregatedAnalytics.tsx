import React, { useMemo } from "react"
import { Grid } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { CardAnalytic } from "../../../common/CardAnalytic"
import { totalPeopleReached } from "../../../common/util"
import { useAnalyticsPageContext } from "../GeneralPageProvider"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import AggregatedCompanyFollowersValue from "./AggregatedCompanyFollowersValue"

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

   const summedResults = useMemo(
      () => sumStats(livestreamStats),
      [livestreamStats]
   )

   const averageNumberOfRegistrations = useMemo(
      () =>
         getAverageNumberOfRegistrations(
            summedResults?.numberOfRegistrations,
            livestreamStats?.length
         ),
      [summedResults?.numberOfRegistrations, livestreamStats?.length]
   )

   return (
      <Grid container spacing={3}>
         {companyPageReady ? (
            <>
               <Grid xs={6} item style={styles.gridItem}>
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
                     value={<AggregatedCompanyFollowersValue />}
                  />
               </Grid>
            </>
         ) : null}
         {hasAts ? (
            <>
               <Grid xs={6} item style={styles.gridItem}>
                  <CardAnalytic
                     title="Talent Pool"
                     value={summedResults.numberOfTalentPoolProfiles}
                     linkDescription={"Go to talents"}
                     link={`/group/${group.id}/admin/analytics/talent-pool?section=1`} // Should go to
                  />
               </Grid>
               <Grid xs={6} item style={styles.gridItem}>
                  <CardAnalytic
                     title="Total applications"
                     value={summedResults.numberOfApplications}
                     linkDescription={"Go to applicants"}
                     link={`/group/${group.id}/admin/ats-integration?section=1`}
                  />
               </Grid>
            </>
         ) : (
            <>
               <Grid xs={6} item style={styles.gridItem}>
                  <CardAnalytic
                     title="Young talent reached"
                     value={summedResults.numberOfPeopleReached}
                  />
               </Grid>
               <Grid xs={6} item style={styles.gridItem}>
                  <CardAnalytic
                     title="Average registrations per stream"
                     value={averageNumberOfRegistrations}
                  />
               </Grid>
            </>
         )}
      </Grid>
   )
}

type SumResult = {
   numberOfApplications: number
   numberOfRegistrations: number
   numberOfPeopleReached: number
   numberOfTalentPoolProfiles: number
}
const sumStats = (stats?: LiveStreamStats[]): SumResult => {
   const initialValue: SumResult = {
      numberOfApplications: 0,
      numberOfRegistrations: 0,
      numberOfPeopleReached: 0,
      numberOfTalentPoolProfiles: 0,
   }

   if (!stats) {
      return initialValue
   }

   return stats.reduce<SumResult>((acc, curr) => {
      const generalStats = curr.generalStats

      return {
         numberOfApplications:
            acc.numberOfApplications + (generalStats?.numberOfApplicants || 0),
         numberOfRegistrations:
            acc.numberOfRegistrations +
            (generalStats?.numberOfRegistrations || 0),
         numberOfPeopleReached:
            acc.numberOfPeopleReached +
            (generalStats?.numberOfPeopleReached || 0),
         numberOfTalentPoolProfiles:
            acc.numberOfTalentPoolProfiles +
            (generalStats?.numberOfTalentPoolProfiles || 0),
      }
   }, initialValue)
}

const getAverageNumberOfRegistrations = (
   numRegistrations?: number,
   numStats?: number
) => {
   const numberOfRegistrations = numRegistrations ?? 0
   const livestreamStatsLength = numStats ?? 0

   // We don't want to divide by 0, so we return 0
   if (numberOfRegistrations === 0 || livestreamStatsLength === 0) {
      return 0
   } else {
      return Math.round(numberOfRegistrations / livestreamStatsLength)
   }
}
export default AggregatedAnalytics
