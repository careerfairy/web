import { FC } from "react"
import { Box, Stack } from "@mui/material"
import { GroupSparkAnalyticsCardContainer } from "./components/GroupSparkAnalyticsCardContainer"
import ChartSwitchButton from "./components/charts/ChartSwitchButton"
import { CFLineChart } from "./components/charts/CFLineChart"
import SparksStaticCard from "./components/SparksStaticCard"

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
   return (
      <Stack spacing={5} marginBottom={10}>
         <GroupSparkAnalyticsCardContainer
            title={`Reach for the past ${timeFilter}`}
         >
            <Box
               sx={{
                  display: "flex",
                  gap: 1.5,
               }}
            >
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
            <Box
               sx={{
                  display: "flex",
                  gap: 1.5,
               }}
            >
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
         <GroupSparkAnalyticsCardContainer title={<MostSomethingTitle />}>
            <Box
               sx={{
                  display: "flex",
                  gap: 1.5,
               }}
            >
               <SparksStaticCard spark={mostSomethingData} />
               <SparksStaticCard spark={mostSomethingData} />
               <SparksStaticCard spark={mostSomethingData} />
            </Box>
         </GroupSparkAnalyticsCardContainer>
      </Stack>
   )
}

const MostSomethingTitle = () => {
   return (
      <Box
         sx={{
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: "30px",
            letterSpacing: "0em",
            textAlign: "left",
            marginBottom: "21px",
         }}
      >
         Your <span style={{ color: "#6749EA" }}>most watched Sparks</span>
      </Box>
   )
}

export default SparksOverviewTab
