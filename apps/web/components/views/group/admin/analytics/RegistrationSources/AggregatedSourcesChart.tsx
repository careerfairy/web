import {
   Box,
   Card,
   CardContent,
   CardHeader,
   Divider,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
   Tooltip,
} from "@mui/material"
import { Line } from "react-chartjs-2"
import { useTheme } from "@mui/material/styles"
import { useUtmData } from "./RegistrationSourcesContext"
import {
   RegistrationSourceWithDates,
   rollupByDay,
   sourcesByDate,
} from "./transformations"
import { useCallback, useMemo, useState } from "react"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import IconButton from "@mui/material/IconButton"
import { VALID_SOURCES } from "./sources"
import GenericDialog from "../../../../common/GenericDialog"

const AggregatedSourcesChart = () => {
   const { utmData } = useUtmData()

   const allSourcesAggregatedByDate = useMemo(() => {
      return sourcesByDate(utmData)
   }, [utmData])

   const [showHelpDialog, setShowHelpDialog] = useState(false)
   const onCloseHelpDialog = useCallback(() => {
      setShowHelpDialog(false)
   }, [])

   return (
      <>
         <Card>
            <CardHeader
               title="Registration Sources"
               action={
                  <Tooltip title="Sources Description">
                     <IconButton
                        aria-label="info"
                        onClick={() => {
                           setShowHelpDialog(true)
                        }}
                     >
                        <InfoOutlinedIcon />
                     </IconButton>
                  </Tooltip>
               }
            />
            <Divider />
            <CardContent>
               <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height={200}
               >
                  <Chart stats={allSourcesAggregatedByDate} />
               </Box>
            </CardContent>
         </Card>
         {showHelpDialog && (
            <GenericDialog
               onClose={onCloseHelpDialog}
               title={"Sources Description"}
            >
               <HelpTable />
            </GenericDialog>
         )}
      </>
   )
}

const HelpTable = () => {
   return (
      <Table>
         <TableHead>
            <TableRow>
               <TableCell>Source Name</TableCell>
               <TableCell>Description</TableCell>
            </TableRow>
         </TableHead>
         <TableBody>
            {VALID_SOURCES.map((source) => (
               <TableRow key={source.displayName}>
                  <TableCell>{source.displayName}</TableCell>
                  <TableCell>{source.helpDescription}</TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   )
}

type Props = {
   stats: RegistrationSourceWithDates[]
}

const Chart = ({ stats }: Props) => {
   const theme = useTheme()

   const chartOptions = useMemo(() => {
      return {
         responsive: true,
         maintainAspectRatio: false,
         legend: {},
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

   const data = {
      labels: Object.keys(stats),
      datasets: [],
   }

   for (let entry of stats) {
      data.datasets.push({
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

   return <Line data={data} options={chartOptions} />
}

export default AggregatedSourcesChart
