import MaterialTable from "@material-table/core"
import React, { useMemo } from "react"
import { useUtmData } from "./RegistrationSourcesContext"
import Card from "@mui/material/Card"
import { TableTitle } from "../../ats-integration/AccountJobs"
import {
   Avatar,
   Box,
   LinearProgress,
   Table,
   TableBody,
   TableCell,
   TableRow,
   Tooltip,
   Typography,
} from "@mui/material"
import { RegistrationSourcesResponseItem } from "@careerfairy/shared-lib/dist/functions/groupAnalyticsTypes"
import {
   getResizedUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions"
import Link from "../../../../common/Link"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import { sxStyles } from "../../../../../../types/commonTypes"
import { sourcesByLivestream, UTMsPercentage } from "./transformations"

const LivestreamsTable = () => {
   const { livestreams, utmData } = useUtmData()
   const isMobile = useIsMobile()

   // append stats to every livestream
   const rows = useMemo(() => {
      return livestreams.map((l) => ({ ...l, utmData }))
   }, [livestreams, utmData])

   return (
      <Card>
         <Box
            sx={{
               "& th:nth-of-type(4) > div": {
                  justifyContent: "center",
               },
            }}
         >
            <MaterialTable
               // @ts-ignore
               columns={columns}
               data={rows}
               title={<TableTitle title="Livestreams" />}
               options={
                  isMobile
                     ? undefined
                     : {
                          tableLayout: "fixed",
                       }
               }
            />
         </Box>
      </Card>
   )
}

const columns = [
   {
      field: "backgroundImageUrl",
      title: "Logo",
      cellStyle: (backgroundImageUrl) => ({
         padding: 0,
         height: 70,
         backgroundImage:
            backgroundImageUrl &&
            `url(${getResizedUrl(backgroundImageUrl, "xs")})`,
         backgroundSize: "cover",
         backgroundRepeat: "no-repeat",
      }),
      render: (rowData) => <Logo logoUrl={rowData.companyLogoUrl} />,
   },
   {
      title: "Title",
      field: "title",
      render: (rowData) => (
         <Link href={`/upcoming-livestream/${rowData.id}`} target="_blank">
            {rowData.title}
         </Link>
      ),
   },
   {
      field: "date",
      title: "Event Date",
      render: (rowData) => {
         return prettyDate(rowData.start)
      },
      type: "date",
   },
   {
      title: "Sources",
      width: "40%",
      render: (row) => {
         return <PercentageTable livestreamId={row.id} utmData={row.utmData} />
      },
   },
]

type PercentageTablesProps = {
   livestreamId: string
   utmData: RegistrationSourcesResponseItem[]
}

const tableStyles = sxStyles({
   cell: { borderBottom: 0, paddingBottom: 1, width: 40, textAlign: "center" },
   nameCell: {
      borderBottom: 0,
      paddingBottom: 1,
      textAlign: "right",
      minWidth: 185,
      maxWidth: 185,
   },
   progressCell: { minWidth: 100, borderBottom: 0, paddingBottom: 1 },
})

const PercentageTable = ({ livestreamId, utmData }: PercentageTablesProps) => {
   const stats = useMemo(() => {
      return sourcesByLivestream(utmData, livestreamId)
   }, [livestreamId, utmData])

   return (
      <Table padding="none">
         <TableBody>
            {stats.map((entry, i) => (
               <TableRow key={i} sx={{ marginBottom: 1 }}>
                  <TableCell sx={tableStyles.nameCell}>
                     <Tooltip
                        title={entry.source.helpDescription}
                        placement="bottom"
                     >
                        <Typography
                           pr={2}
                           variant="body2"
                           color="text.secondary"
                        >
                           {entry.source.displayName}
                        </Typography>
                     </Tooltip>
                  </TableCell>
                  <TableCell sx={tableStyles.progressCell}>
                     <ProgressBar source={entry} />
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                     <Typography pl={2} variant="body2" color="text.secondary">
                        {entry.total}
                     </Typography>
                  </TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   )
}

const ProgressBar = ({ source }: { source: UTMsPercentage }) => {
   return (
      <Tooltip title={source.source.displayName} arrow placement="top">
         <LinearProgress
            sx={{
               borderRadius: 5,
               minHeight: 5,
               minWidth: 50,
               "&.MuiLinearProgress-colorPrimary:not(.MuiLinearProgress-buffer)":
                  {
                     backgroundColor: "rgba(0, 0, 0, 0.1)",
                  },
               "& .MuiLinearProgress-colorPrimary": {
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
               },
               "& .MuiLinearProgress-barColorPrimary": {
                  backgroundColor: source.source.color,
               },
            }}
            variant="determinate"
            value={source.percent}
         />
      </Tooltip>
   )
}

const Logo = ({ logoUrl }) => {
   return (
      <Box
         display="flex"
         justifyContent="center"
         alignItems="center"
         position="relative"
         height="100%"
         width="100%"
         minWidth={160}
      >
         <Avatar
            sx={{
               width: "70%",
               height: "70%",
               maxHeight: 85,
               boxShadow: 5,
               background: "common.white",
               "& img": {
                  objectFit: "contain",
                  maxWidth: "90%",
                  maxHeight: "90%",
               },
               display: "flex",
               borderRadius: (theme) => theme.spacing(0.5),
               borderBottomRightRadius: (theme) => [
                  theme.spacing(2.5),
                  "!important",
               ],
               borderTopLeftRadius: (theme) => [
                  theme.spacing(2.5),
                  "!important",
               ],
            }}
            variant="rounded"
            src={getResizedUrl(logoUrl, "xs")}
         />
      </Box>
   )
}

export default LivestreamsTable
