import React, { useState } from "react"
import { Tabs, Tab, Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ResponsiveSelectWithDrawer } from "./components/ResponsiveSelectWithDrawer"
import { GroupSparkAnalyticsCardContainer } from "./components/GroupSparkAnalyticsCardContainer"
import CFPieChart from "./components/charts/CFPieChart"
import SparksOverviewTab from "./overview-tab/SparksOverviewTab"
import { TimePeriodParams } from "@careerfairy/shared-lib/sparks/analytics"
import { GroupSparkAnalyticsCardContainerTitle } from "./components/GroupSparkAnalyticsCardTitle"

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

const pieChartRawData = [
   {
      university: "Other",
      total_talent: 34,
   },
   {
      university: "ETHZ - ETH Zurich",
      total_talent: 14,
   },
   {
      university: "Universität St. Gallen",
      total_talent: 10,
   },
   {
      university: "EPFL - EPF Lausanne",
      total_talent: 6,
   },
   {
      university: "ZHAW - Zürcher Hochschule für Angewandte Wissenschaften",
      total_talent: 5,
   },
   {
      university: "University of Zürich",
      total_talent: 5,
   },
   {
      university: "Technische Universität Darmstadt",
      total_talent: 4,
   },
   {
      university: "Technische Universität Wien",
      total_talent: 4,
   },
   {
      university: "University of Basel",
      total_talent: 3,
   },
   {
      university: "Universität Bern",
      total_talent: 3,
   },
]

const pieChartProcessedData = pieChartRawData.map((d, i) => {
   return {
      id: i,
      value: d.total_talent,
      label: d.university,
   }
})

type TimeFilter = {
   value: TimePeriodParams
   label: string
}

const GroupSparkAnalytics = () => {
   const [tabValue, setTabValue] = useState("overview")
   const [selectTimeFilter, setSelectTimeFilter] =
      useState<TimeFilter["value"]>("30days")

   const handleTabChange = (event, newValue) => {
      setTabValue(newValue)
   }

   const options: TimeFilter[] = [
      { value: "7days", label: "Past 7 days" },
      { value: "30days", label: "Past 30 days" },
      { value: "6months", label: "Past 6 months" },
      { value: "1year", label: "Last year" },
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
               <>
                  <GroupSparkAnalyticsCardContainer>
                     <GroupSparkAnalyticsCardContainerTitle>
                        Top 10 countries
                     </GroupSparkAnalyticsCardContainerTitle>
                     Audience: Top 10 countries for {selectTimeFilter} days
                     <CFPieChart data={pieChartProcessedData} />
                  </GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainer>
                     <GroupSparkAnalyticsCardContainerTitle>
                        Top 10 universities
                     </GroupSparkAnalyticsCardContainerTitle>
                     Audience: Top 10 universities for {selectTimeFilter} days
                  </GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainer>
                     <GroupSparkAnalyticsCardContainerTitle>
                        Top 10 fields of study
                     </GroupSparkAnalyticsCardContainerTitle>
                     Audience: Top 10 fields of study for {selectTimeFilter}{" "}
                     days
                  </GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainer>
                     <GroupSparkAnalyticsCardContainerTitle>
                        Level of study
                     </GroupSparkAnalyticsCardContainerTitle>
                     Audience: Level of study for {selectTimeFilter} days
                  </GroupSparkAnalyticsCardContainer>
               </>
            )}
         </Box>
      </Box>
   )
}

export default GroupSparkAnalytics
