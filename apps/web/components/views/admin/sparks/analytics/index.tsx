import React, { useState } from "react"
import { Tabs, Tab, Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ResponsiveSelectWithDrawer } from "./components/ResponsiveSelectWithDrawer"
import { GroupSparkAnalyticsCardContainer } from "./components/GroupSparkAnalyticsCardContainer"
import { CFLineChart } from "./components/charts/CFLineChart"
import ChartSwitchButton from "./components/charts/ChartSwitchButton"

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

const GroupSparkAnalytics = () => {
   const [tabValue, setTabValue] = useState("overview")
   const [selectValue, setSelectValue] = useState("30")

   const handleTabChange = (event, newValue) => {
      setTabValue(newValue)
   }

   const options = [
      { value: "7", label: "Past 7 days" },
      { value: "30", label: "Past 30 days" },
      { value: "180", label: "Past 6 months" },
      { value: "365", label: "Last year" },
   ]

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
               selectValue={selectValue}
               setSelectValue={setSelectValue}
               options={options}
               selectContainerProps={{
                  sx: styles.selectDrawer,
               }}
            />
         </Box>
         <Box>
            {tabValue === "overview" && (
               <>
                  <GroupSparkAnalyticsCardContainer title="Reach for the past 30 days">
                     Overview: Reach for {selectValue} days
                     <Box
                        sx={{
                           display: "flex",
                           gap: 1.5,
                        }}
                     >
                        <ChartSwitchButton
                           label={"Total views"}
                           value={"1.5k"}
                           active={true}
                        />
                        <ChartSwitchButton
                           label={"Unique viewers"}
                           value={"1.1k"}
                           active={false}
                        />
                     </Box>
                     <CFLineChart />
                  </GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainer title="Engagement for the past 30 days">
                     Overview: Reach for {selectValue} days
                     <Box
                        sx={{
                           display: "flex",
                           gap: 1.5,
                        }}
                     >
                        <ChartSwitchButton
                           label={"Likes"}
                           value={"450"}
                           active={true}
                        />
                        <ChartSwitchButton
                           label={"Shares"}
                           value={"800"}
                           active={false}
                        />
                        <ChartSwitchButton
                           label={"Registrations"}
                           value={"10"}
                           active={false}
                        />
                        <ChartSwitchButton
                           label={"Page clicks"}
                           value={"23"}
                           active={false}
                        />
                     </Box>
                     <CFLineChart />
                  </GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainer title="Your most watched Sparks">
                     Overview: Most watched {selectValue} days
                  </GroupSparkAnalyticsCardContainer>
               </>
            )}
            {tabValue === "audience" && (
               <>
                  <GroupSparkAnalyticsCardContainer title="Top 10 countries">
                     Audience: Top 10 countries for {selectValue} days
                  </GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainer title="Top 10 universities">
                     Audience: Top 10 universities for {selectValue} days
                  </GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainer title="Top 10 fields of study">
                     Audience: Top 10 fields of study for {selectValue} days
                  </GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainer title="Level of study">
                     Audience: Level of study for {selectValue} days
                  </GroupSparkAnalyticsCardContainer>
               </>
            )}
         </Box>
      </Box>
   )
}

export default GroupSparkAnalytics
