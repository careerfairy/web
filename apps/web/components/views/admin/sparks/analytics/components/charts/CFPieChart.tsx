import { FC } from "react"
import { Box, Stack } from "@mui/material"
import {
   PiePlot,
   PieSeriesType,
   ChartsTooltip,
   ChartsItemContentProps,
   DefaultizedPieValueType,
   ResponsiveChartContainer,
} from "@mui/x-charts"
import StyledChartTooltip from "./StyledChartTooltip"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   legendLabel: {
      color: "#5C5C6A",
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "27px",
      letterSpacing: "0em",
   },
   legendValue: {
      color: "#8E8E8E",
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "24px",
      letterSpacing: "0em",
   },
})

const colorMapDesc = [
   "#5D42D3",
   "#6749EA",
   "#856DEE",
   "#9580F0",
   "#A492F2",
   "#B3A4F5",
   "#C2B6F7",
   "#D1C8F9",
   "#E1DBFB",
   "#F0EDFD",
]

type PieChartData = {
   data: PieSeriesType["data"]
}

type ChartLegendContentEntryProps = {
   color: string
   label: string
   value: string
}

const ChartLegendContentEntry: FC<ChartLegendContentEntryProps> = ({
   color,
   label,
   value,
}) => {
   return (
      <Box display="flex" justifyContent="space-between">
         <Box display="flex" alignItems="center" marginRight={1}>
            <Box
               width={16}
               height={16}
               borderRadius="50%"
               bgcolor={color}
               marginRight={1}
            />
            <Box sx={styles.legendLabel}>{label}</Box>
         </Box>
         <Box sx={styles.legendValue}>{value}</Box>
      </Box>
   )
}

const ChartLegendContent: FC<PieChartData> = ({ data }) => {
   return (
      <Stack>
         {data.map((d) => (
            <ChartLegendContentEntry
               key={d.id}
               color={colorMapDesc[d.id]}
               label={d.label}
               value={`${d.value}%`}
            />
         ))}
      </Stack>
   )
}

const CustomTooltip: FC<ChartsItemContentProps> = ({ itemData, series }) => {
   if (!itemData || !series) return null

   const item = series.data[itemData.dataIndex] as DefaultizedPieValueType

   return (
      <StyledChartTooltip
         title={item.label}
         value={`${item.value}%`}
         label={""}
      />
   )
}

const PieChartContent: FC<PieChartData> = ({ data }) => {
   return (
      <ResponsiveChartContainer
         series={[
            {
               type: "pie",
               data: data,
            },
         ]}
         width={400}
         height={400}
         colors={colorMapDesc}
      >
         <PiePlot />
         <ChartsTooltip
            trigger="item"
            slots={{
               itemContent: (props) => <CustomTooltip {...props} />,
            }}
         />
      </ResponsiveChartContainer>
   )
}

const CFPieChart: FC<PieChartData> = ({ data }) => {
   return (
      <Box width={"100%"}>
         <PieChartContent data={data} />
         <ChartLegendContent data={data} />
      </Box>
   )
}

export default CFPieChart
