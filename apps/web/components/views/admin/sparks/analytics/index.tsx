import React, { useState } from "react"
import { Tabs, Tab, Box } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ResponsiveSelectWithDrawer } from "./components/ResponsiveSelectWithDrawer"
import { GroupSparkAnalyticsCardContainer } from "./components/GroupSparkAnalyticsCardContainer"
import { CFLineChart } from "./components/charts/CFLineChart"
import ChartSwitchButton from "./components/charts/ChartSwitchButton"
import SparksStaticCard from "./components/SparksStaticCard"
import CFPieChart from "./components/charts/CFPieChart"
import { SparkCategory } from "@careerfairy/shared-lib/sparks/sparks"

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

const years = [
   new Date(1990, 0, 1),
   new Date(1991, 0, 1),
   new Date(1992, 0, 1),
   new Date(1993, 0, 1),
   new Date(1994, 0, 1),
   new Date(1995, 0, 1),
   new Date(1996, 0, 1),
   new Date(1997, 0, 1),
   new Date(1998, 0, 1),
   new Date(1999, 0, 1),
   new Date(2000, 0, 1),
   new Date(2001, 0, 1),
   new Date(2002, 0, 1),
   new Date(2003, 0, 1),
   new Date(2004, 0, 1),
   new Date(2005, 0, 1),
   new Date(2006, 0, 1),
   new Date(2007, 0, 1),
   new Date(2008, 0, 1),
   new Date(2009, 0, 1),
   new Date(2010, 0, 1),
   new Date(2011, 0, 1),
   new Date(2012, 0, 1),
   new Date(2013, 0, 1),
   new Date(2014, 0, 1),
   new Date(2015, 0, 1),
   new Date(2016, 0, 1),
   new Date(2017, 0, 1),
   new Date(2018, 0, 1),
]

const UKGDPperCapita = [
   26189, 25792, 25790, 26349, 27277, 27861, 28472, 29259, 30077, 30932, 31946,
   32660, 33271, 34232, 34865, 35623, 36214, 36816, 36264, 34402, 34754, 34971,
   35185, 35618, 36436, 36941, 37334, 37782, 38058,
]

const spark = {
   id: "GtAz8lKg9POi9TVrJSxs",
   category: { id: "company-culture" as SparkCategory["id"] },
   question: "What's one great benefit of working at ABB?",
   video: {
      thumbnailUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/sparks%2Fthumbnails%2Fec15e7ae-a46a-4dc5-8681-09fff96d0227.jpeg?alt=media&token=2e4a781f-65ae-4720-af50-4fe9f05c6eb4",
   },
   group: { universityName: "ABB" },
   creator: {
      firstName: "Antonia Maria",
      lastName: "Mauch",
      avatarUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/groups%2FlgHmyR0XipDBcYm0UPtH%2Fcreator-avatars%2F567fb7db-4497-486d-8317-0ae399ad2df2.png?alt=media&token=42ae5f6c-6b03-4a49-942c-7fde52584a87",
   },
}

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
                     <Box sx={{ marginLeft: "-20px" }}>
                        <CFLineChart
                           tooltipLabel="Likes"
                           xAxisData={years}
                           seriesData={UKGDPperCapita}
                        />
                     </Box>
                  </GroupSparkAnalyticsCardContainer>
                  <GroupSparkAnalyticsCardContainer title="Your most watched Sparks">
                     Overview: Most watched {selectValue} days
                     <Box
                        sx={{
                           display: "flex",
                           gap: 1.5,
                        }}
                     >
                        <SparksStaticCard spark={spark} />
                     </Box>
                  </GroupSparkAnalyticsCardContainer>
               </>
            )}
            {tabValue === "audience" && (
               <>
                  <GroupSparkAnalyticsCardContainer title="Top 10 countries">
                     Audience: Top 10 countries for {selectValue} days
                     <CFPieChart data={pieChartProcessedData} />
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
