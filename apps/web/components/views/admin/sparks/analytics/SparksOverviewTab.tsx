import { FC, useState } from "react"
import { Box, Stack } from "@mui/material"
import { GroupSparkAnalyticsCardContainer } from "./components/GroupSparkAnalyticsCardContainer"
import ChartSwitchButton from "./components/charts/ChartSwitchButton"
import { CFLineChart } from "./components/charts/CFLineChart"
import SparksStaticCard from "./components/SparksStaticCard"
import { ResponsiveSelectWithDrawer } from "./components/ResponsiveSelectWithDrawer"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   sparksContainer: {
      display: "flex",
      flexDirection: {
         xs: "column",
         md: "row",
      },
      gap: 1.5,
   },
   mostSomethingContainerTitleContainer: {
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "30px",
      letterSpacing: "0em",
      textAlign: "left",
      marginBottom: "21px",
      display: "flex",
      alignItems: "center",
   },
   mostSomethingSelect: {
      width: "100%",
      textTransform: "lowercase",
      color: "#6749EA",
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "30px",
      letterSpacing: "0em",
   },
   mostSomethingSelectMenu: {
      marginTop: 4,
      marginLeft: "-3px",
      ".MuiPaper-root": {
         minWidth: "0 !important",
      },
   },
   mostSomethingSelectContainer: {
      "& .MuiSelect-select": {
         paddingLeft: "0 !important",
         paddingTop: "0 !important",
         paddingBottom: "0 !important",
      },
      "& fieldset": {
         "&.MuiOutlinedInput-notchedOutline": {
            border: "0 !important",
         },
      },
   },
   chartSwitchButtonsContainers: {
      display: {
         xs: "none",
         md: "flex",
      },
      gap: 1.5,
   },
})

const MostSomethingTitle = ({
   selectMostSomething,
   setSelectMostSomething,
   options,
}) => {
   return (
      <Box sx={styles.mostSomethingContainerTitleContainer}>
         Your&nbsp;
         <ResponsiveSelectWithDrawer
            selectValue={selectMostSomething}
            setSelectValue={setSelectMostSomething}
            options={options}
            selectProps={{
               sx: styles.mostSomethingSelect,
            }}
            selectMenuProps={{
               anchorOrigin: {
                  vertical: "top",
                  horizontal: "left",
               },
               transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
               },
               sx: styles.mostSomethingSelectMenu,
            }}
            selectContainerProps={{ sx: styles.mostSomethingSelectContainer }}
         />
      </Box>
   )
}

const mostSomethingSelectOptions = [
   { value: "watched", label: "Most watched Sparks" },
   { value: "liked", label: "Most liked Sparks" },
   { value: "shared", label: "Most shared Sparks" },
   { value: "recent", label: "Most recent Sparks" },
]

type SparksOverviewTabProps = {
   timeFilter: any
   reachData: any
   engagementData: {
      xAxis: any[]
      series: any[]
   }
   mostSomethingData: any
}

const SparksOverviewTab: FC<SparksOverviewTabProps> = ({
   timeFilter,
   reachData,
   engagementData,
   mostSomethingData,
}) => {
   const [selectMostSomething, setSelectMostSomething] = useState("watched")

   return (
      <Stack spacing={5} marginBottom={10}>
         <GroupSparkAnalyticsCardContainer
            title={`Reach for the past ${timeFilter}`}
         >
            <Box sx={styles.chartSwitchButtonsContainers}>
               <ChartSwitchButton
                  label={"Total views"}
                  value={"0"}
                  active={true}
               />
               <ChartSwitchButton
                  label={"Unique viewers"}
                  value={"0"}
                  active={false}
               />
            </Box>
            <CFLineChart />
         </GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainer
            title={`Engagement for the past ${timeFilter}`}
         >
            <Box sx={styles.chartSwitchButtonsContainers}>
               <ChartSwitchButton label={"Likes"} value={"450"} active={true} />
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
                  xAxisData={engagementData.xAxis}
                  seriesData={engagementData.series}
               />
            </Box>
         </GroupSparkAnalyticsCardContainer>
         <GroupSparkAnalyticsCardContainer
            title={
               <MostSomethingTitle
                  selectMostSomething={selectMostSomething}
                  setSelectMostSomething={setSelectMostSomething}
                  options={mostSomethingSelectOptions}
               />
            }
         >
            <Box sx={styles.sparksContainer}>
               <SparksStaticCard spark={mostSomethingData} />
               <SparksStaticCard spark={mostSomethingData} />
               <SparksStaticCard spark={mostSomethingData} />
            </Box>
         </GroupSparkAnalyticsCardContainer>
      </Stack>
   )
}

export default SparksOverviewTab
