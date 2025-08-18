import { Box, Typography } from "@mui/material"
import React from "react"
import { User, CheckCircle, Users, ChevronRight } from "react-feather"
import { useGroup } from "layouts/GroupDashboardLayout"
import { sxStyles } from "types/commonTypes"
import { totalPeopleReached } from "../../common/util"
import { AggregatedTalentPoolValue } from "./AggregatedTalentPoolValue"
import CardCustom from "../../common/CardCustom"

const styles = sxStyles({
   container: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      p: 2, // 16px padding for the tile
   },
   title: {
      mb: 2, // 16px padding between title and cards
   },
   cardsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 1, // 8px between cards
   },
   metricCard: {
      display: "flex",
      alignItems: "center",
      p: 1.5, // 12px padding
      backgroundColor: (theme) => theme.brand.white[300],
      borderRadius: "6px",
      cursor: "pointer",
      border: "1px solid transparent",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[400],
         borderColor: "secondary.200", // Purple 200
      },
   },
   iconContainer: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      backgroundColor: "secondary.50", // purple 50
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mr: 1.5, // 12px gap
   },
   icon: {
      width: 24,
      height: 24,
      color: "secondary.600", // purple 600
   },
   textContainer: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      mr: 1.5, // 12px gap before chevron
   },
   metricLabel: {
      color: "neutral.600",
   },
   metricValue: {
      color: "neutral.800",
      fontWeight: "bold",
   },
   chevronIcon: {
      color: "neutral.700",
   },
})

type MetricCardProps = {
   icon: React.ReactNode
   label: string
   value: React.ReactNode
   onClick?: () => void
}

const MetricCard = ({ icon, label, value, onClick }: MetricCardProps) => {
   return (
      <Box sx={styles.metricCard} onClick={onClick}>
         <Box sx={styles.iconContainer}>
            <Box sx={styles.icon}>
               {React.cloneElement(icon as React.ReactElement, {
                  strokeWidth: 2.5,
               })}
            </Box>
         </Box>
         <Box sx={styles.textContainer}>
            <Typography variant="brandedBody" sx={styles.metricLabel}>
               {label}
            </Typography>
            <Typography variant="brandedH4" sx={styles.metricValue}>
               {value}
            </Typography>
         </Box>
         <Box sx={styles.chevronIcon}>
            <ChevronRight size={20} strokeWidth={2.5} />
         </Box>
      </Box>
   )
}

export const AnalyticsTile = () => {
   const { group, stats } = useGroup()

   const handleTalentReachedClick = () => {
      // Navigate to analytics page or relevant section
      window.location.href = `/group/${group.id}/admin/analytics`
   }

   const handleRegistrationsClick = () => {
      // Navigate to analytics page or relevant section
      window.location.href = `/group/${group.id}/admin/analytics`
   }

   const handleTalentPoolClick = () => {
      // Navigate to talent pool if not a university group
      if (!group.universityCode) {
         window.location.href = `/group/${group.id}/admin/talent-pool`
      }
   }

   return (
      <CardCustom sx={styles.container} title="Analytics">
         <Box sx={styles.cardsContainer}>
            <MetricCard
               icon={<User />}
               label="Talent reached"
               value={totalPeopleReached(stats)}
               onClick={handleTalentReachedClick}
            />
            <MetricCard
               icon={<CheckCircle />}
               label="Total registrations"
               value={stats?.generalStats?.numberOfRegistrations ?? 0}
               onClick={handleRegistrationsClick}
            />
            <MetricCard
               icon={<Users />}
               label="Talent pool size"
               value={<AggregatedTalentPoolValue />}
               onClick={handleTalentPoolClick}
            />
         </Box>
      </CardCustom>
   )
}
