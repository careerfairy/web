import ExportCSVIcon from "@mui/icons-material/GetApp"
import {
   Box,
   Card,
   CardContent,
   CardHeader,
   IconButton,
   Tooltip,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import Chart from "chart.js"
import { useRef } from "react"
import { Doughnut } from "react-chartjs-2"
import { useSelector } from "react-redux"
import { createSelector } from "reselect"
import CustomLegend from "../../../../../materialUI/Legends"
import { convertStringToArray } from "../../../../helperFunctions/HelperFunctions"
import {
   doughnutOptions,
   exportChartDataToCsv,
   randomColor,
} from "../../../../util/chartUtils"
import { colorsArray } from "../../../../util/colors"
import { universityCountriesMap } from "../../../../util/constants/universityCountries"

if (typeof window !== "undefined" && Chart.defaults.global) {
   Chart.defaults.global.plugins.labels = false
}

const distributionSelector = createSelector(
   (state) => state.firestore.data["universityCountryDistribution"],
   (_, { theme }) => theme,
   (universityCountryDistribution, theme) => {
      const mapOfTotals = universityCountryDistribution?.totalByCountry || {}
      const dataArray = Object.keys(mapOfTotals)
         .map((key) => ({
            code: key,
            value: mapOfTotals[key],
            countryName: universityCountriesMap[key] || "Unknown",
         }))
         .sort((a, b) => b.value - a.value)
      const colors = [...colorsArray, ...dataArray.map(() => randomColor())]
      const data = {
         datasets: [
            {
               data: dataArray.map(({ value }) => value),
               backgroundColor: colors,
               borderWidth: 8,
               borderColor: theme.palette.common.white,
               hoverBorderColor: theme.palette.common.white,
            },
         ],
         labels: dataArray.map(({ countryName }) =>
            convertStringToArray(countryName)
         ),
      }

      return { data, colors, dataArray }
   }
)

const UniversityCountriesChart = () => {
   const chartRef = useRef()
   const theme = useTheme()
   const { data, colors, dataArray } = useSelector((state) =>
      distributionSelector(state, { theme })
   )
   const handleExportChartToCSV = () => {
      exportChartDataToCsv(chartRef, "Student University Country Distribution")
   }

   return (
      <Card>
         <CardHeader
            title="Student University Country Distribution"
            action={
               <Tooltip title="Export this chart data to CSV">
                  <IconButton onClick={handleExportChartToCSV} size="large">
                     <ExportCSVIcon />
                  </IconButton>
               </Tooltip>
            }
         />
         <CardContent>
            <Box
               height={300}
               position="relative"
               display="flex"
               flexDirection="column"
               justifyContent="center"
               alignItems="center"
            >
               <Doughnut
                  data={data}
                  ref={chartRef}
                  options={doughnutOptions(true, theme)}
               />
            </Box>
            <Box display="flex" justifyContent="center" mt={2}>
               <CustomLegend
                  options={dataArray}
                  colors={colors}
                  chartRef={chartRef}
                  fullWidth
                  hideEmpty
                  chartData={data}
                  optionDataType="Student"
                  optionValueProp="value"
               />
            </Box>
         </CardContent>
      </Card>
   )
}

export default UniversityCountriesChart
