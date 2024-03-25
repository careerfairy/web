import React, { useState } from "react"
import { Tabs, Tab, Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ResponsiveSelectWithDrawer } from "./components/ResponsiveSelectWithDrawer"
import { LockedSparksAnalytics } from "./components/LockedSparksAnalytics"
import SparksOverviewTab from "./overview-tab/SparksOverviewTab"
import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import SparksAudienceTab from "./audience-tab/SparksAudienceTab"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useAuth } from "HOCs/AuthProvider"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"
import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"

const styles = sxStyles({
   root: {
      mx: "auto",
      width: "93.58%",
   },
   controlHeader: {
      display: "flex",
      justifyContent: "space-between",
      flexDirection: {
         xs: "column",
         md: "row",
      },
      marginTop: { md: "17px" },
      marginBottom: { md: "20px" },
   },
   tabs: {
      "*": {
         textTransform: "none !important",
         fontWeight: 400,
         fontSize: {
            md: "1.2rem",
         },
      },
      alignSelf: "center",
      ".Mui-selected": {
         fontWeight: 600,
         color: "#6749EA !important",
      },
      ".MuiTabs-indicator": {
         backgroundColor: "#6749EA",
      },
   },
   mobileLimiter: {
      display: {
         md: "none",
      },
      width: {
         xs: "100%",
      },
      marginTop: {
         xs: "-2px",
      },
      borderBottom: {
         xs: "2px solid #EFEFEF",
      },
   },
   selectDrawer: {
      margin: {
         xs: "17px 0 12px 0",
         md: 0,
      },
   },
})

type TimeFilter = {
   value: TimePeriodParams
   label: string
}

const GroupSparkAnalytics = () => {
   const { group } = useGroup()
   const { userData } = useAuth()
   const planStatus = useGroupPlanIsValid(group.groupId, [
      GroupPlanTypes.Tier1,
      GroupPlanTypes.Tier2,
      GroupPlanTypes.Tier3,
   ])
   const [tabValue, setTabValue] = useState("overview")
   const [selectTimeFilter, setSelectTimeFilter] =
      useState<TimeFilter["value"]>("30days")

   const handleTabChange = (_, newValue) => {
      setTabValue(newValue)
   }

   // CF Admins can see analytics in trial mode
   const shoulLockAnalytics = !planStatus.valid || !userData.isAdmin

   const options: TimeFilter[] = [
      { value: "7days", label: "Past 7 days" },
      { value: "30days", label: "Past 30 days" },
      { value: "6months", label: "Past 6 months" },
      { value: "1year", label: "Last year" },
   ]

   if (shoulLockAnalytics) {
      return <LockedSparksAnalytics />
   }

   return (
      <Box sx={styles.root}>
         <Box sx={styles.controlHeader}>
            <Tabs
               value={tabValue}
               onChange={handleTabChange}
               aria-label="Spark Analytics Tabs"
               sx={styles.tabs}
            >
               <Tab label="Overview" value="overview" />
               <Tab label="Audience" value="audience" />
            </Tabs>
            <Box component="span" sx={styles.mobileLimiter} />
            <ResponsiveSelectWithDrawer
               selectValue={selectTimeFilter}
               setSelectValue={setSelectTimeFilter}
               options={options}
               selectContainerProps={{
                  sx: styles.selectDrawer,
               }}
            />
         </Box>
         <Box>
            {tabValue === "overview" && (
               <SparksOverviewTab timeFilter={selectTimeFilter} />
            )}
            {tabValue === "audience" && (
               <SparksAudienceTab timeFilter={selectTimeFilter} />
            )}
         </Box>
      </Box>
   )
}

export default GroupSparkAnalytics
