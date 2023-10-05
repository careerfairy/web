import { Typography } from "@mui/material"
import { Box } from "@mui/material"
import SadIcon from "@mui/icons-material/SentimentDissatisfiedRounded"
import dynamic from "next/dynamic"
import React, { useMemo, useRef, useCallback, useState } from "react"
import { darken, useTheme } from "@mui/material/styles"
import { sxStyles } from "types/commonTypes"
import { DateTimeFormatOptions } from "luxon"
import { ApexOptions } from "apexcharts"
import CalendarFilter from "./CalendarFilter"
import { renderToString } from "react-dom/server"
import { Filter as FilterIcon } from "react-feather"
import { CalendarChartDataType } from "./AcademicCalendar"
import { DateTime } from "luxon"

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
   sadIcon: { fontSize: "80px" },
})

type Props = {
   seriesData: CalendarChartDataType
}

const now = DateTime.local()
const sixDaysAgo = now.minus({ days: 6 })
const sixMonthsLater = now.plus({ months: 6 })

const iconString = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
   renderToString(<FilterIcon color={"#6F8193"} />)
)}`

const CalendarChart = ({ seriesData }: Props) => {
   const chartRef = useRef()
   const theme = useTheme()
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

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

   const handleFilterClick = useCallback(() => {
      setAnchorEl((anchor) => (anchor == null ? chartRef.current : null))
   }, [])

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
                           icon: `<img src=${iconString} style='height: 18px; margin-top: 2.5px; margin-left: 3px;'>`,
                           index: 5,
                           title: "filter",
                           class: "custom-icon-filter",
                           click: handleFilterClick,
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
               min: sixMonthsAgo.toMillis(),
               max: sixMonthsLater.toMillis(),
               labels: { datetimeFormatter: { month: "01 MMM " } },
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
            states: {
               hover: {
                  filter: {
                     type: "darken",
                     value: 0.4,
                  },
               },
            },
            tooltip: {
               custom: renderTooltip,
               x: {
                  format: "dd MMM 'yy",
               },
            },
         } as ApexOptions),
      [
         colorArray,
         handleFilterClick,
         renderTooltip,
         theme.typography.fontFamily,
      ]
   )

   const isEmptyData = useMemo(
      () =>
         seriesData
            ? seriesData.length <= 0 || seriesData[0].name == "empty"
            : true,
      [seriesData]
   )

   const popoverProps = useMemo(
      () =>
         ({
            open: Boolean(anchorEl),
            anchorEl: anchorEl,
            onClose: () => setAnchorEl(null),
            anchorOrigin: { horizontal: "right", vertical: "top" },
            transformOrigin: { vertical: "top", horizontal: "right" },
            keepMounted: false, // Does not mount the children when dialog is closed
         } as const),
      [anchorEl]
   )

   return (
      <Box component={"span"} ref={chartRef} sx={styles.chartContainer}>
         {isEmptyData ? <EmptyDataDisplay /> : null}
         <CalendarFilter showTitle={true} popoverProps={popoverProps} />
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
         <SadIcon sx={styles.sadIcon} color={"secondary"}></SadIcon>
         <Typography variant="h4" fontWeight={600}>
            No university selected
         </Typography>
         <Typography>
            Select a country and university from the filters to render the
            calendar
         </Typography>
      </Typography>
   </Box>
)

export default CalendarChart
