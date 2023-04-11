import { Box, Card, CardContent, Divider, Typography } from "@mui/material"
import { Line } from "react-chartjs-2"
import { useTheme } from "@mui/material/styles"
import { useUtmData } from "./RegistrationSourcesContext"
import {
   RegistrationSourceWithDates,
   rollupByDay,
   sourcesByDate,
} from "./transformations"
import React, { useCallback, useMemo, useState } from "react"
import { RegistrationSource, VALID_SOURCES } from "./sources"
import { StyledCheckbox } from "../../common/inputs"
import { sxStyles } from "../../../../../../types/commonTypes"

type ISourceFilter = RegistrationSource & {
   active: boolean
}

const styles = sxStyles({
   chart: {
      display: "flex",
      height: 350,
   },
   filterWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
   },
   filterSection: {
      display: "flex",
      cursor: "pointer",
      alignItems: "center",
   },
})

const AggregatedSourcesChart = () => {
   const { utmData } = useUtmData()

   const [sourceFilters, setSourceFilters] = useState<ISourceFilter[]>(
      VALID_SOURCES.map((source) => ({
         ...source,
         active: true,
      }))
   )

   const allSourcesAggregatedByDate = useMemo(() => {
      return sourcesByDate(utmData)
   }, [utmData])

   const handleFilterClick = useCallback(
      (source: ISourceFilter) => {
         const indexToUpdate = sourceFilters.findIndex(
            ({ displayName }) => displayName === source.displayName
         )
         const updatedSourceFilter = {
            ...source,
            active: !source.active,
         }

         setSourceFilters((prevSourceFilters) => [
            ...prevSourceFilters.slice(0, indexToUpdate),
            updatedSourceFilter,
            ...prevSourceFilters.slice(indexToUpdate + 1),
         ])
      },
      [sourceFilters]
   )

   const renderSourceFilter = useCallback(
      () => (
         <Box sx={styles.filterWrapper}>
            {sourceFilters.map((source, index) => (
               <>
                  {index > 0 ? <Divider /> : null}
                  <Box
                     sx={styles.filterSection}
                     key={source.displayName}
                     onClick={() => handleFilterClick(source)}
                  >
                     <StyledCheckbox checked={source.active} />
                     <Box>
                        <Typography variant={"body1"} fontWeight={400}>
                           {source.displayName}
                        </Typography>
                        <Box
                           sx={{
                              width: "36px",
                              borderRadius: "6px",
                              border: `2px solid ${source.color}`,
                           }}
                        />
                     </Box>
                  </Box>
               </>
            ))}
         </Box>
      ),
      [handleFilterClick, sourceFilters]
   )

   return (
      <>
         <Card>
            <Divider />
            <CardContent>
               <Box sx={styles.chart}>
                  <Box width={"80%"}>
                     <Chart
                        stats={allSourcesAggregatedByDate}
                        filters={sourceFilters}
                     />
                  </Box>
                  <Box width={"20%"} display={"flex"}>
                     <Divider orientation="vertical" sx={{ mx: 2 }} />
                     {renderSourceFilter()}
                  </Box>
               </Box>
            </CardContent>
         </Card>
      </>
   )
}

type Props = {
   stats: RegistrationSourceWithDates[]
   filters: ISourceFilter[]
}

const Chart = ({ stats, filters }: Props) => {
   const theme = useTheme()

   const chartOptions = useMemo(() => {
      return {
         responsive: true,
         maintainAspectRatio: false,
         legend: {
            display: false,
         },
         tooltips: {
            mode: "x",
         },
         scales: {
            xAxes: [
               {
                  type: "time",
                  distribution: "series",
                  time: {
                     unit: "day",
                  },
                  gridLines: {
                     display: false,
                     drawBorder: false,
                  },
                  ticks: {
                     maxTicksLimit: 15,
                  },
               },
            ],
            yAxes: [
               {
                  gridLines: {
                     borderDash: [2],
                     borderDashOffset: [2],
                     color: theme.palette.divider,
                     drawBorder: false,
                     zeroLineBorderDash: [2],
                     zeroLineBorderDashOffset: [2],
                     zeroLineColor: theme.palette.divider,
                  },
                  ticks: {
                     beginAtZero: true,
                     precision: 0,
                  },
               },
            ],
         },
      }
   }, [theme])

   const data = useMemo(() => {
      const tmp = {
         labels: Object.keys(stats),
         datasets: [],
      }

      for (let entry of stats) {
         const isSourceActive =
            filters.find(
               (filter) => filter.displayName === entry.source.displayName
            )?.active || false

         if (isSourceActive) {
            tmp.datasets.push({
               label: entry.source.displayName,
               pointBackgroundColor: entry.source.color,
               borderColor: entry.source.color,
               fill: false,
               borderWidth: 2,
               data: rollupByDay(
                  entry.dates.map((date) => ({
                     x: date,
                     y: 1,
                  }))
               ),
            })
         }
      }

      return tmp
   }, [filters, stats])

   return <Line data={data} options={chartOptions} />
}

export default AggregatedSourcesChart
