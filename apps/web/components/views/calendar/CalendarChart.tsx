import { Typography } from "@mui/material"
import { Box } from "@mui/material"
import SadIcon from "@mui/icons-material/SentimentDissatisfiedRounded"
import dynamic from "next/dynamic"
import React, { useMemo, useRef, useCallback } from "react"
import { useTheme } from "@mui/material/styles"
import { sxStyles } from "types/commonTypes"
import { DateTimeFormatOptions } from "luxon"
import { ApexOptions } from "apexcharts"

const Chart = dynamic(() => import("react-apexcharts"), {
   ssr: false,
})

const styles = sxStyles({
   emptyDisplayContainer: {
      position: "absolute",
      inset: 0,
      backgroundColor: "white",
      zIndex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   chartContainer: {
      height: "100%",
      position: "relative",
      display: "block",
      backgroundColor: "white",
      padding: 2,
      borderRadius: "5px",
   },
})

type Props = {
   seriesData: { name: string; data: { x: any; y: any[] }[] }[]
   setAnchorEl: (anchor: null | HTMLElement) => void
}

const CalendarChart = ({ seriesData, setAnchorEl }: Props) => {
   const chartRef = useRef()
   const theme = useTheme()

   const colorArray = useMemo(
      () => [
         theme.palette.primary.main,
         theme.palette.secondary.main,
         theme.palette.grey.main,
      ],
      [
         theme.palette.grey.main,
         theme.palette.primary.main,
         theme.palette.secondary.main,
      ]
   )

   const isEmptyData = useMemo(
      () =>
         seriesData
            ? seriesData.length <= 0 || seriesData[0].name == "empty"
            : true,
      [seriesData]
   )

   const renderTooltip = useCallback(
      function ({ seriesIndex, dataPointIndex }) {
         const dateOptions = {
            year: "2-digit",
            month: "short",
            day: "2-digit",
         } as DateTimeFormatOptions

         let start = new Date(
            seriesData[seriesIndex].data[dataPointIndex].y[0]
         ).toLocaleString("en-UK", dateOptions)
         start = start.slice(0, 7) + "'" + start.slice(7)

         let end = new Date(
            seriesData[seriesIndex].data[dataPointIndex].y[1]
         ).toLocaleString("en-UK", dateOptions)
         end = end.slice(0, 7) + "'" + end.slice(7)

         return (
            "<div style='padding: 6px'>" +
            "<span style='font-weight: bold; color: grey'> " +
            seriesData[seriesIndex].data[dataPointIndex].x +
            "</span> <br/>" +
            "<span style='font-weight: bold; color:" +
            colorArray[seriesIndex] +
            "'>" +
            seriesData[seriesIndex].name +
            ":</span> <span> " +
            start +
            " - " +
            end +
            "</span> </div>"
         )
      },
      [colorArray, seriesData]
   )

   const chartOptions = useMemo(
      () =>
         ({
            chart: {
               background: "white",
               fontFamily: theme.typography.fontFamily,
               toolbar: {
                  tools: {
                     download: false,
                     customIcons: [
                        {
                           icon: "<img src='https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/timeline-university-assets%2FFilter.svg?alt=media&token=16c14c52-a49d-41f7-826a-a6308834d64b' style='margin-top: 3px'/>",
                           index: 5,
                           title: "filter",
                           class: "custom-icon-filter",
                           click: function () {
                              setAnchorEl(chartRef.current)
                           },
                        },
                     ],
                  },
               },
            },
            plotOptions: {
               bar: {
                  horizontal: true,
                  barHeight: "80%",
                  borderRadius: 2,
               },
            },
            xaxis: {
               type: "datetime",
               labels: { datetimeFormatter: { month: "01 MMM " } },
            },
            yaxis: {
               labels: {
                  align: "left",
                  offsetX: -20,
               },
            },
            stroke: {
               width: 1,
            },
            fill: {
               type: "solid",
               opacity: 0.6,
            },
            legend: {
               floating: false,
               position: "top",
               horizontalAlign: "left",
            },
            colors: colorArray,
            tooltip: {
               custom: renderTooltip,
               x: {
                  format: "dd MMM 'yy",
               },
            },
         } as ApexOptions),
      [colorArray, renderTooltip, setAnchorEl, theme.typography.fontFamily]
   )

   return (
      <Box component={"span"} ref={chartRef} sx={styles.chartContainer}>
         {isEmptyData ? <EmptyDataDisplay /> : null}
         <Chart
            type="rangeBar"
            series={seriesData}
            height="100%"
            options={chartOptions}
         />
      </Box>
   )
}

const EmptyDataDisplay = () => (
   <Box sx={styles.emptyDisplayContainer}>
      <Typography align="center">
         <SadIcon sx={{ fontSize: "80px" }} color="secondary"></SadIcon>
         <Typography variant="h4" fontWeight={600}>
            No data selected
         </Typography>
         <Typography>
            Select a country and university from the filters to render the
            calendar
         </Typography>
      </Typography>
   </Box>
)

export default CalendarChart
