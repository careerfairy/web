import { GroupStats } from "@careerfairy/shared-lib/groups/stats"
import { Box, Grid, Typography } from "@mui/material"
import Link from "components/views/common/Link"
import { useGroup } from "layouts/GroupDashboardLayout"
import { ChevronRight } from "react-feather"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../CardCustom"
import { AggregatedTalentPoolValue } from "./AggregatedTalentPoolValue"
import AverageRegistrationsValue from "./AverageRegistrationsValue"

const styles = sxStyles({
   value: {
      fontSize: "3.43rem",
   },
   subheaderLink: {
      textDecoration: "none",
      fontWeight: 600,
   },
   subheaderIcon: {
      width: "18px",
      marginLeft: "5px",
   },
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
               title="Total people reached"
               tooltip="Total number of people exposed to your company"
               value={totalPeopleReached(stats)}
            />
         </Grid>

         <Grid item xs={6} style={styles.gridItem}>
            <CardAnalytic
               title="Total registered users"
               tooltip="Total number of registrations to all your streams"
               value={stats.generalStats.numberOfRegistrations}
            />
         </Grid>

         <Grid item xs={6} style={styles.gridItem}>
            {group.atsAdminPageFlag ? (
               <CardAnalytic
                  title="Total applications"
                  // @ts-ignore TODO: remove this ignore when numberOfApplications field has been added
                  value={stats.generalStats.numberOfApplications ?? 0}
                  linkDescription={"Go to applicants"}
                  link={`/group/${group.id}/admin/ats-integration?section=1`}
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
               linkDescription={"Go to talents"}
               link={`/group/${group.id}/admin/analytics?section=1`}
            />
         </Grid>
      </Grid>
   )
}

type Props = {
   title: string
   tooltip?: string
   value: React.ReactNode
   link?: string
   linkDescription?: string
}

export const CardAnalytic = ({
   title,
   tooltip,
   value,
   link,
   linkDescription,
}: Props) => {
   const subHeader = link ? (
      <SubheaderLink link={link} title={linkDescription} />
   ) : undefined

   return (
      <CardCustom title={title} helpTooltip={tooltip} subHeader={subHeader}>
         <Typography mt={1} sx={styles.value} align="right">
            {value}
         </Typography>
      </CardCustom>
   )
}

const SubheaderLink = ({ link, title }: { link: string; title: string }) => {
   return (
      <Link href={link} color="secondary" sx={styles.subheaderLink}>
         <Box display="flex" mt={1}>
            <span>{title}</span>
            <ChevronRight style={styles.subheaderIcon} />
         </Box>
      </Link>
   )
}

/**
 * Sum the total of people reached
 *
 * Since the numberOfPeopleReached was introduced afterwards, it still has a small value for
 * some groups, lets sum it with the registrations until it catches up
 */
function totalPeopleReached(stats: GroupStats) {
   if (
      stats.generalStats.numberOfPeopleReached <
      stats.generalStats.numberOfRegistrations
   ) {
      return (
         stats.generalStats.numberOfPeopleReached +
         stats.generalStats.numberOfRegistrations
      )
   }

   return stats.generalStats.numberOfPeopleReached
}

export default AggregatedAnalytics
