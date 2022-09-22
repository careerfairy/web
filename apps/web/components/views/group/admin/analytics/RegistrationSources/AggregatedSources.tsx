import { Box, Card, CardContent, CardHeader, Divider } from "@mui/material"
import { Line } from "react-chartjs-2"
import { useTheme } from "@mui/material/styles"

const AggregatedSources = () => {
   return (
      <Card>
         <CardHeader title="Registration Sources" />
         <Divider />
         <CardContent>
            <Box
               display="flex"
               alignItems="center"
               justifyContent="center"
               height={200}
            >
               <Chart />
            </Box>
         </CardContent>
      </Card>
   )
}

const Chart = () => {
   const theme = useTheme()

   const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
         xAxes: [
            {
               type: "time",
               distribution: "series",
               time: {
                  unit: "day",
               },
               ticks: {
                  fontColor: theme.palette.text.secondary,
                  // maxTicksLimit: 15,
               },
               gridLines: {
                  display: false,
                  drawBorder: false,
               },
            },
         ],
         yAxes: [
            {
               ticks: {
                  fontColor: theme.palette.text.secondary,
                  beginAtZero: true,
                  min: 0,
                  precision: 0,
               },
               gridLines: {
                  borderDash: [2],
                  borderDashOffset: [2],
                  color: theme.palette.divider,
                  drawBorder: false,
                  zeroLineBorderDash: [2],
                  zeroLineBorderDashOffset: [2],
                  zeroLineColor: theme.palette.divider,
               },
            },
         ],
      },
   }

   const now = new Date()
   const data = {
      labels: ["Instagram"],
      datasets: [
         {
            label: "Instagram",
            data: [
               { x: new Date(), y: 1 },
               { x: new Date(now.setDate(now.getDate() - 5)), y: 3 },
               { x: new Date(now.setDate(now.getDate() - 10)), y: 2 },
            ],
         },
         {
            label: "Facebook",
            data: [
               { x: new Date(), y: 5 },
               { x: new Date(now.setDate(now.getDate() - 2)), y: 10 },
               { x: new Date(now.setDate(now.getDate() - 15)), y: 6 },
            ],
         },
      ],
   }

   return <Line data={data} options={chartOptions} />
}

export default AggregatedSources
