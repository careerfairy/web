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

function CustomBackground() {
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

const CustomTooltipContent = (props) => {
   const { axisData } = props

   if (!axisData) return null
   // Customize your tooltip appearance here
   return (
      <div style={{ backgroundColor: "red" }}>
         <p>{axisData.x.value.toString()}</p>
         <p>{axisData.y.value}</p>
      </div>
   )
}

function CustomTick(props) {
   const { width } = useDrawingArea()

   return <line x2={-1 * width} stroke="#F3F3F5" strokeWidth={1} />
}

function CustomTickLabel(props) {
   // The props include the data for the tick label
   const { x, y, text } = props

   // You can render any custom SVG element here
   return (
      <text x={x} y={y} textAnchor="start" fill="#666">
         {text}
      </text>
   )
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

const CFLineChart = () => {
   return (
      <ResponsiveChartContainer
         sx={{
            "& .MuiLineElement-root": {
               strokeWidth: 1,
               stroke: "#6749EA",
            },
            "& .MuiAreaElement-series-MyChartData": {
               fill: "#6749EA11",
            },
            ".MuiChartsAxisHighlight-root": {
               zIndex: "90 !important",
            },
         }}
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
               id: "MyChartData",
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
         width={600}
         height={300}
      >
         <CustomBackground />
         <ChartsXAxis disableLine />
         <ChartsYAxis
            position="right"
            disableLine
            slots={{
               axisTick: CustomTick,
               axisTickLabel: CustomTickLabel,
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
               axisContent: CustomTooltipContent,
            }}
         />
      </ResponsiveChartContainer>
   )
}

export { CFLineChart }
