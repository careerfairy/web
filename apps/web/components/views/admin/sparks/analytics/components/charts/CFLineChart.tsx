import * as React from "react"
import {
   ChartsXAxis,
   ChartsYAxis,
   ResponsiveChartContainer,
   useDrawingArea,
   ChartsTooltip,
   HighlightScope,
   ChartsAxisHighlight,
} from "@mui/x-charts"
import {
   AreaPlot,
   LineHighlightElement,
   LineHighlightPlot,
   LinePlot,
} from "@mui/x-charts/LineChart"
import StyledChartTooltip from "./StyledChartTooltip"
import { sxStyles } from "types/commonTypes"

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
   26189, 25792.014, 25790.186, 26349.342, 27277.543, 27861.215, 28472.248,
   29259.764, 30077.385, 30932.537, 31946.037, 32660.441, 33271.3, 34232.426,
   34865.78, 35623.625, 36214.07, 36816.676, 36264.79, 34402.36, 34754.473,
   34971, 35185, 35618, 36436, 36941, 37334, 37782.83, 38058.086,
]

const styles = sxStyles({
   chart: {
      ".MuiLineElement-root": {
         strokeWidth: 1,
         stroke: "#6749EA",
      },
      ".MuiAreaElement-root": {
         fill: "#6749EA11",
      },
      ".MuiChartsAxisHighlight-root": {
         stroke: "#6749EA33",
         strokeWidth: 1,
      },
      ".MuiChartsAxis-tickLabel": {
         fontSize: "14px",
         letterSpacing: "0em",
         fill: "#6B6B7F",
      },
      ".MuiChartsAxis-tick": {
         stroke: "#F3F3F5",
         strokeWidth: 1,
      },
      ".MuiChartsAxis-bottom": {
         ".MuiChartsAxis-tickContainer": {
            ":first-of-type": {
               // to prevent server-side rendering issues
               text: {
                  textAnchor: "start",
               },
            },
            ":last-of-type": {
               // to prevent server-side rendering issues
               text: {
                  textAnchor: "end",
               },
            },
         },
      },
   },
   popperRoot: {
      inset: "10px auto auto 10px !important",
      margin: 10,
   },
})

const CustomBackground = () => {
   const { left, top, width, height } = useDrawingArea()

   return (
      <rect
         x={left}
         y={top - 10}
         width={width}
         height={height + 10}
         fill="#FCFCFE"
      />
   )
}

const CustomYTick = (props) => {
   const { width } = useDrawingArea()

   return <line x2={-1 * width} stroke="#F3F3F5" strokeWidth={1} />
}

const CustomLineHighlightElement = (props) => {
   return (
      <LineHighlightElement
         {...props}
         sx={{
            stroke: "#6749EA",
            strokeWidth: 3,
            fill: "#F3F3F5",
         }}
      />
   )
}

const CustomTooltip = (props) => {
   const { axisData } = props

   if (!axisData) return null

   return (
      <StyledChartTooltip
         title={"Friday, 19 Oct 2023"}
         value={"17"}
         label={"Views"}
      />
   )
}

const CFLineChart = () => {
   return (
      <ResponsiveChartContainer
         sx={styles.chart}
         xAxis={[
            {
               id: "Years",
               data: years,
               scaleType: "time",
               valueFormatter: (date) => date.getFullYear().toString(),
            },
         ]}
         series={[
            {
               type: "line",
               data: UKGDPperCapita,
               area: true,
               color: "#6749EA",
               highlightScope: {
                  highlighted: "item",
                  faded: "none",
               } as HighlightScope,
            },
         ]}
         margin={{ left: 20, top: 10, right: 60 }}
         width={1039}
         height={313}
      >
         <CustomBackground />
         <ChartsXAxis disableLine />
         <ChartsYAxis
            position="right"
            disableLine
            slots={{
               axisTick: CustomYTick,
            }}
         />
         <AreaPlot />
         <LinePlot />
         <ChartsAxisHighlight x="line" />
         <LineHighlightPlot
            slots={{ lineHighlight: CustomLineHighlightElement }}
         />
         <ChartsTooltip
            slots={{
               axisContent: CustomTooltip,
            }}
         />
      </ResponsiveChartContainer>
   )
}

export { CFLineChart }
