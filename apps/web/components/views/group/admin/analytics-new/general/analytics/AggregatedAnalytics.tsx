import React, { FC, useMemo } from "react"
import { Grid } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { ATSCard, CardAnalytic } from "../../../common/CardAnalytic"
import { useAnalyticsPageContext } from "../GeneralPageProvider"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import AggregatedCompanyFollowersValue from "./AggregatedCompanyFollowersValue"
import useGroupATSAccounts from "../../../../../../custom-hook/useGroupATSAccounts"
import Skeleton from "@mui/material/Skeleton"
import useGroupCompanyPageProgress from "../../../../../../custom-hook/useGroupCompanyPageProgress"

const styles = sxStyles({
   gridItem: {
      display: "flex",
   },
   skeletonStat: {
      ml: "auto",
   },
})

type Props = {
   progress: ReturnType<typeof useGroupCompanyPageProgress>
}
const AggregatedAnalytics: FC<Props> = ({ progress }) => {
   const { groupPresenter, group, stats } = useGroup()
   const { livestreamStats } = useAnalyticsPageContext()

   const { data: accounts } = useGroupATSAccounts(
      groupPresenter.id,
      groupPresenter
   )

   const hasAts = accounts.length > 0

   const companyPageReady = progress?.isReady

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

   const talentPoolCard = (
      <CardAnalytic
         title="Talent Pool"
         value={summedResults.numberOfTalentPoolProfiles}
         linkDescription={"Go to talent pool"}
         link={`/group/${group.id}/admin/analytics/talent-pool?section=1`} // Should go to
      />
   )

   return (
      <Grid container spacing={3}>
         {companyPageReady ? (
            <>
               <Grid xs={6} item style={styles.gridItem}>
                  <CardAnalytic
                     title="Company page views"
                     tooltip="Total number of talent that viewed your company page"
                     value={
                        stats?.generalStats?.numberOfPeopleReachedCompanyPage ??
                        0
                     }
                  />
               </Grid>
               <Grid xs={6} item style={styles.gridItem}>
                  <CardAnalytic
                     title="Followers"
                     tooltip="Total number of talent who follow your company"
                     value={<AggregatedCompanyFollowersValue />}
                  />
               </Grid>
            </>
         ) : null}
         {hasAts ? (
            <>
               <Grid xs={6} item style={styles.gridItem}>
                  {talentPoolCard}
               </Grid>
               <Grid xs={6} item style={styles.gridItem}>
                  <ATSCard value={summedResults.numberOfApplications} />
               </Grid>
            </>
         ) : (
            <>
               <Grid xs={6} item style={styles.gridItem}>
                  {talentPoolCard}
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

export const SuspenseAggregatedAnalytics = () => {
   return (
      <Grid container spacing={3}>
         <Grid xs={6} item style={styles.gridItem}>
            <CardAnalytic
               title={<Skeleton variant="text" width={120} />}
               value={
                  <Skeleton
                     sx={styles.skeletonStat}
                     variant="text"
                     width={60}
                  />
               }
            />
         </Grid>
         <Grid xs={6} item style={styles.gridItem}>
            <CardAnalytic
               title={<Skeleton variant="text" width={120} />}
               value={
                  <Skeleton
                     sx={styles.skeletonStat}
                     variant="text"
                     width={50}
                  />
               }
            />
         </Grid>
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
         numberOfPeopleReached: 0,
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
