import { FC } from "react"
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

const styles = sxStyles({
   chart: {
      "& .MuiLineElement-root": {
         strokeWidth: 1,
         stroke: "#6749EA",
      },
      "& .MuiAreaElement-root": {
         fill: "#6749EA11",
      },
      "& .MuiChartsAxisHighlight-root": {
         stroke: "#6749EA33",
         strokeWidth: 1,
      },
      "& .MuiChartsAxis-tickLabel": {
         fontSize: "14px",
         letterSpacing: "0em",
         fill: "#6B6B7F",
      },
      "& .MuiChartsAxis-tick": {
         stroke: "#F3F3F5",
         strokeWidth: 1,
      },
   },
   lineHighlightElement: {
      stroke: "#6749EA",
      strokeWidth: 3,
      fill: "#F3F3F5",
   },
})

const CHART_HEIGHT = 313 // Design specification

const defaultDataForEmptyView = {
   xAxis: [
      new Date(1970, 0, 5), // Monday, 5 Jan 1970
      new Date(1970, 0, 6), // Tuesday, 6 Jan 1970
      new Date(1970, 0, 7), // Wednesday, 7 Jan 1970
      new Date(1970, 0, 8), // Thursday, 8 Jan 1970
      new Date(1970, 0, 9), // Friday, 9 Jan 1970
      new Date(1970, 0, 10), // Saturday, 10 Jan 1970
      new Date(1970, 0, 11), // Sunday, 11 Jan 1970
   ],
   series: [0, 10, 20, 30, 40, 50, 60],
}

// Utility function to keep date format consistent accross the different elements of the chart
const formatDate = (date, options) => {
   return new Intl.DateTimeFormat("en-GB", options).format(date)
}

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
   return <LineHighlightElement {...props} sx={styles.lineHighlightElement} />
}

const CustomTooltip = (props) => {
   const { axisData, label, series } = props

   if (!axisData) return null

   const date = new Date(axisData.x.value)
   const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
   }
   const formattedDate = formatDate(date, options)

   const yValue = series[axisData.x.index]

   return (
      <StyledChartTooltip title={formattedDate} value={yValue} label={label} />
   )
}

type CFLineChartProps = {
   tooltipLabel: string
   xAxisData?: any
   seriesData?: (number | null)[]
}

const lineChartValueFormatter = (date, isChartEmpty) => {
   const options = isChartEmpty
      ? { weekday: "long" }
      : {
           day: "numeric",
           month: "short",
           year: "numeric",
        }
   return formatDate(date, options).toString()
}

const CFLineChart: FC<CFLineChartProps> = ({
   tooltipLabel,
   xAxisData = defaultDataForEmptyView.xAxis,
   seriesData = defaultDataForEmptyView.series,
}) => {
   const isEmpty =
      xAxisData === defaultDataForEmptyView.xAxis ||
      seriesData === defaultDataForEmptyView.series

   return (
      <ResponsiveChartContainer
         sx={styles.chart}
         xAxis={[
            {
               id: "Years",
               data: xAxisData,
               scaleType: "time",
               valueFormatter: (date) => lineChartValueFormatter(date, isEmpty),
            },
         ]}
         series={[
            {
               type: "line",
               data: seriesData,
               area: true,
               color: "#6749EA",
               highlightScope: {
                  highlighted: "item",
                  faded: "none",
               } as HighlightScope,
            },
         ]}
         height={CHART_HEIGHT}
      >
         <CustomBackground />
         <ChartsXAxis
            disableLine
            tickInterval={isEmpty ? defaultDataForEmptyView.xAxis : undefined}
         />
         <ChartsYAxis
            position="right"
            disableLine
            slots={{
               axisTick: CustomYTick,
            }}
         />
         {!isEmpty && (
            <>
               <AreaPlot />
               <LinePlot />
               <ChartsAxisHighlight x="line" />
               <LineHighlightPlot
                  slots={{ lineHighlight: CustomLineHighlightElement }}
               />
               <ChartsTooltip
                  slots={{
                     axisContent: (props) => (
                        <CustomTooltip
                           {...props}
                           label={tooltipLabel}
                           series={seriesData}
                        />
                     ),
                  }}
               />
            </>
         )}
      </ResponsiveChartContainer>
   )
}

export { CFLineChart }
