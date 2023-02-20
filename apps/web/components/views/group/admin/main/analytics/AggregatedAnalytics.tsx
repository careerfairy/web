import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { Box, Grid, Typography } from "@mui/material"
import Link from "components/views/common/Link"
import { useGroup } from "layouts/GroupDashboardLayout"
import { ChevronRight } from "react-feather"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../CardCustom"
import { useMainPageContext } from "../MainPageProvider"
import { AggregatedTalentPoolValue } from "./AggregatedTalentPoolValue"

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
})

const AggregatedAnalytics = () => {
   const { livestreamStats } = useMainPageContext()
   const { group } = useGroup()

   return (
      <Grid container spacing={2}>
         <Grid item xs={6}>
            <CardAnalytic
               title="Total people reached"
               tooltip="Total number of people exposed to your company"
               value={totalGeneralStats(
                  livestreamStats,
                  "numberOfPeopleReached"
               )}
            />
         </Grid>

         <Grid item xs={6}>
            <CardAnalytic
               title="Total registered users"
               tooltip="Total number of registrations for all your streams"
               value={totalGeneralStats(
                  livestreamStats,
                  "numberOfRegistrations"
               )}
            />
         </Grid>

         <Grid item xs={6}>
            {group.atsAdminPageFlag ? (
               <CardAnalytic
                  title="Total applications"
                  value={totalGeneralStats(
                     livestreamStats,
                     "numberOfApplicants"
                  )}
                  linkDescription={"Go to applicants"}
                  link={`/group/${group.id}/admin/ats-integration?section=1`}
               />
            ) : (
               <CardAnalytic
                  title="Average registrations per stream"
                  value={averageRegistrationsPerLivestream(livestreamStats)}
               />
            )}
         </Grid>

         <Grid item xs={6}>
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
const CardAnalytic = ({
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

function totalGeneralStats(
   stats: LiveStreamStats[],
   stat: keyof LiveStreamStats["generalStats"]
) {
   return (
      stats?.reduce((acc, cur) => {
         if (cur.generalStats[stat]) {
            return acc + cur.generalStats[stat]
         } else {
            return acc
         }
      }, 0) ?? 0
   )
}

function averageRegistrationsPerLivestream(stats: LiveStreamStats[]) {
   if (!stats || stats.length === 0) return 0

   let len = 0
   const sum =
      stats.reduce((acc, cur) => {
         if (cur.generalStats["numberOfRegistrations"]) {
            len++
            return acc + cur.generalStats["numberOfRegistrations"]
         } else {
            return acc
         }
      }, 0) ?? 0

   return Math.round(sum / len)
}

export default AggregatedAnalytics
