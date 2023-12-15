import { FC } from "react"
import {
   ChartsXAxis,
   ChartsYAxis,
   ChartsTooltip,
   LineSeriesType,
   useDrawingArea,
   HighlightScope,
   ChartsAxisHighlight,
   ChartsAxisContentProps,
   ResponsiveChartContainer,
} from "@mui/x-charts"
import {
   AreaPlot,
   LinePlot,
   LineHighlightPlot,
   LineHighlightElement,
   LineHighlightElementProps,
} from "@mui/x-charts/LineChart"
import { sxStyles } from "types/commonTypes"
import StyledChartTooltip from "./StyledChartTooltip"

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
      "& .MuiChartsAxis-tickContainer": {
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

   return <rect x={left} y={top} width={width} height={height} fill="#FCFCFE" />
}

const CustomYTick: FC = () => {
   const { width } = useDrawingArea()

   return <line x2={-1 * width} stroke="#F3F3F5" strokeWidth={1} />
}

const CustomLineHighlightElement: FC<LineHighlightElementProps> = (props) => {
   return <LineHighlightElement {...props} sx={styles.lineHighlightElement} />
}

type CustomTooltipProps = {
   label: string
   seriesData?: LineSeriesType["data"]
} & ChartsAxisContentProps

const CustomTooltip: FC<CustomTooltipProps> = (props) => {
   const { axisData, label, seriesData } = props

   if (!axisData) return null

   const date = new Date(axisData.x.value)
   const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
   }
   const formattedDate = formatDate(date, options)

   const yValue = seriesData[axisData.x.index].toLocaleString() // Groups digits with comma separator, example: 10123 => 10,123

   return (
      <StyledChartTooltip title={formattedDate} value={yValue} label={label} />
   )
}

type CFLineChartProps = {
   tooltipLabel: string
   xAxisData?: any[]
   seriesData?: LineSeriesType["data"]
}

const lineChartValueFormatter = (date: Date, isChartEmpty: boolean): string => {
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
                           seriesData={seriesData}
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
