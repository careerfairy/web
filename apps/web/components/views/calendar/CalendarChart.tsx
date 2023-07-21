import { Typography } from "@mui/material"
import { Box } from "@mui/material"
import SadIcon from "@mui/icons-material/SentimentDissatisfiedRounded"
import dynamic from "next/dynamic"
import React, { useMemo, useRef } from "react"
import { useTheme } from "@mui/material/styles"

const Chart = dynamic(() => import("react-apexcharts"), {
   ssr: false,
})

const CalendarChart = ({ seriesData, setAnchorEl }: Props) => {
   const chartRef = useRef()
   const theme = useTheme()

   const isEmptyData = useMemo(
      () =>
         seriesData
            ? seriesData.length <= 0 || seriesData[0].name == "empty"
            : true,
      [seriesData]
   )

   const emptyDataDisplay = (
      <Box
         sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "white",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
         }}
      >
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

   return (
      <Box
         component={"span"}
         ref={chartRef}
         height="100%"
         sx={{
            position: "relative",
            display: "block",
         }}
      >
         {isEmptyData ? emptyDataDisplay : null}
         <Chart
            type="rangeBar"
            series={seriesData}
            height="100%"
            options={{
               chart: {
                  background: "white",
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
               colors: [
                  theme.palette.primary.main,
                  theme.palette.secondary.main,
                  theme.palette.grey.main,
               ],
               tooltip: {
                  x: {
                     format: "dd MMM 'yy",
                  },
               },
            }}
         />
      </Box>
   )
}

type Props = {
   seriesData: { name: string; data: { x: any; y: any[] }[] }[]
   setAnchorEl: (anchor: null | HTMLElement) => void
}

export default CalendarChart
