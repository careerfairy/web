import MaterialTable from "@material-table/core"
import React, { useCallback, useMemo } from "react"
import { useUtmData } from "./RegistrationSourcesContext"
import Card from "@mui/material/Card"
import { TableTitle } from "../../ats-integration/AccountJobs"
import {
   LinearProgress,
   Table,
   TableBody,
   TableCell,
   TableRow,
   Tooltip,
   Typography,
} from "@mui/material"
import { RegistrationSourcesResponseItem } from "@careerfairy/shared-lib/dist/functions/groupAnalyticsTypes"
import { prettyDate } from "../../../../../helperFunctions/HelperFunctions"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import { sxStyles } from "../../../../../../types/commonTypes"
import {
   sourcesByLivestream,
   UTMsPercentage,
} from "@careerfairy/shared-lib/livestreams/sources/transformations"
import { VALID_SOURCES } from "@careerfairy/shared-lib/livestreams/sources/sources"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"

const LivestreamsTable = () => {
   const { livestreams, utmData } = useUtmData()
   const isMobile = useIsMobile()

   // append stats to every livestream
   const rows = useMemo(() => {
      return livestreams.map((l) => ({ ...l, utmData }))
   }, [livestreams, utmData])

   const rowOnClick = useCallback((event, rowData) => {
      if (window) {
         window.open(makeLivestreamEventDetailsUrl(rowData.id), "_blank")
      }
   }, [])

   return (
      <Card>
         <MaterialTable
            // @ts-ignore
            columns={columns}
            onRowClick={rowOnClick}
            data={rows}
            title={<TableTitle title="Livestreams" />}
            options={{
               toolbar: false,
               draggable: false,
               tableLayout: isMobile ? "auto" : "fixed",
               emptyRowsWhenPaging: false,
            }}
         />
      </Card>
   )
}

const columns = [
   {
      title: "Live stream title",
      field: "title",
      width: "45%",
      headerStyle: { fontWeight: 600, fontSize: "13px", padding: "24px" },
      render: (rowData) => (
         <Typography ml={1} fontWeight={500}>
            {rowData.title}
         </Typography>
      ),
   },
   {
      title: "Live stream date",
      field: "date",
      headerStyle: { fontWeight: 600, fontSize: "13px" },
      render: (rowData) => {
         return (
            <Typography fontWeight={400}>
               {prettyDate(rowData.start)}
            </Typography>
         )
      },
      type: "date",
   },
   {
      title: "Sources",
      width: "40%",
      textAlign: "end",
      headerStyle: {
         fontWeight: 600,
         fontSize: "13px",
         paddingRight: "24px",
         textAlign: "end",
      },
      sorting: false,
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
      const livestreamSources = sourcesByLivestream(utmData, livestreamId)

      return VALID_SOURCES.map((source) => {
         // We need to compare the livestream sources with the {VALID_SOURCES}, ensuring that we display all sources regardless of whether they have a value
         const sourceIndex = livestreamSources.findIndex(
            (livestreamSource) =>
               livestreamSource.source.displayName === source.displayName
         )

         if (sourceIndex >= 0) {
            // if source has value, use it
            return livestreamSources[sourceIndex]
         } else {
            // if source has no value, create an empty one
            return {
               percent: 0,
               total: 0,
               source: source,
            } as UTMsPercentage
         }
      })
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
                           fontWeight={400}
                           color="text.primary"
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

export default LivestreamsTable
