import { UserData } from "@careerfairy/shared-lib/users"
import {
   Box,
   Card,
   CardContent,
   CardHeader,
   MenuItem,
   Select,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import Chart from "chart.js"
import "chartjs-plugin-labels"
import { useEffect, useRef, useState } from "react"
import { Doughnut } from "react-chartjs-2"
import CustomLegend from "../../../../../materialUI/Legends"
import { sxStyles } from "../../../../../types/commonTypes"
import useUserBreakdownStats from "../../../../custom-hook/useUserBreakdownStats"
import { percentageDonutConfig } from "../../../../util/chartUtils"
import EmptyDisplay from "../displays/EmptyDisplay"

Chart.defaults.global.plugins.labels = false

const styles = sxStyles({
   root: {
      background: "background.default",
   },
   header: {
      paddingBottom: 0,
   },
})

const getChartOptions = (theme) => ({
   cutoutPercentage: 70,
   layout: { padding: 0 },
   legend: {
      display: false,
   },
   maintainAspectRatio: false,
   responsive: true,
   tooltips: {
      backgroundColor: theme.palette.background.default,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: "index",
      titleFontColor: theme.palette.text.primary,
   },
   plugins: {
      labels: percentageDonutConfig,
   },
})

interface Props {
   audience: UserData[]
}
const AudienceCategoryChart = ({ audience }: Props) => {
   const theme = useTheme()
   const chartRef = useRef()
   const [chartOptions, setChartOptions] = useState(getChartOptions(theme))
   const {
      currentStats,
      totalStats,
      handleStatChange,
      hasNoData,
      chartData,
      colors,
   } = useUserBreakdownStats(audience)

   useEffect(() => {
      setChartOptions(getChartOptions(theme))
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [theme.palette.mode])

   return (
      <Card sx={styles.root}>
         <CardHeader sx={styles.header} title="Student Distribution" />
         <CardContent>
            <Select
               fullWidth
               variant="outlined"
               value={currentStats?.id || ""}
               onChange={({ target: { value } }) => handleStatChange(value)}
            >
               {totalStats.map(({ id, label }) => (
                  <MenuItem key={id} value={id}>
                     {label}
                  </MenuItem>
               ))}
            </Select>
            <Box
               height={300}
               marginTop={2}
               position="relative"
               display="flex"
               flexDirection="column"
               justifyContent="center"
               alignItems="center"
            >
               {hasNoData ? (
                  <EmptyDisplay text="Not enough group data" />
               ) : (
                  <Doughnut
                     data={chartData}
                     ref={chartRef}
                     options={chartOptions}
                  />
               )}
            </Box>
            {!hasNoData && (
               <Box display="flex" justifyContent="center" mt={2}>
                  <CustomLegend
                     options={currentStats?.dataArray}
                     colors={colors}
                     chartRef={chartRef}
                     fullWidth
                     chartData={chartData}
                     optionDataType="Student"
                     optionValueProp="count"
                  />
               </Box>
            )}
         </CardContent>
      </Card>
   )
}

export default AudienceCategoryChart
