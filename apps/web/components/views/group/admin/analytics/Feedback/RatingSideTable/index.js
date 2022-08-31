import React, { useCallback, useEffect, useRef, useState } from "react"
import { Card } from "@mui/material"
import {
   defaultTableOptions,
   getPageSize,
   renderRatingStars,
   StarRatingInputValue,
   tableIcons,
} from "../../common/TableUtils"
import { prettyDate } from "../../../../../../helperFunctions/HelperFunctions"
import { alpha, useTheme } from "@mui/material/styles"
import ExportTable from "../../../../../common/Tables/ExportTable"
import { CSVDialogDownload } from "../../../../../../custom-hook/useMetaDataActions"
import { exportSelectionAction } from "../../../../../../util/tableUtils"

const columns = [
   {
      field: "rating",
      title: "Rating",
      width: 160,
   },
   {
      field: "date",
      title: "Voted",
      width: 200,
      render: (rowData) => prettyDate(rowData.timestamp),
      type: "date",
   },
   {
      field: "message",
      title: "Message",
      width: 250,
   },
]

const RatingSideTable = ({ currentRating, fetchingStreams, sideRef }) => {
   const dataTableRef = useRef(null)

   const theme = useTheme()
   const [data, setData] = useState([])

   useEffect(() => {
      if (currentRating?.voters?.length) {
         setData(currentRating.voters)
      } else {
         setData([])
      }
   }, [currentRating])

   useEffect(() => {
      if (dataTableRef.current) {
         dataTableRef.current.onAllSelected(false)
      }
   }, [currentRating?.id])
   const active = () => {
      return Boolean(currentRating)
   }

   const customOptions = { ...defaultTableOptions }
   // customOptions.selection = false;
   customOptions.headerStyle = {
      background: alpha(theme.palette.navyBlue.main, 0.05),
   }
   customOptions.exportButton.pdf = true
   customOptions.pageSize = getPageSize(customOptions.pageSizeOptions, data)

   const [csvDownloadData, setCsvDownloadData] = useState(null)

   const handleCloseCsvDialog = useCallback(() => {
      setCsvDownloadData(null)
   }, [])

   return (
      <>
         <Card raised={active()} ref={sideRef}>
            <ExportTable
               key={data.length}
               icons={tableIcons}
               tableRef={dataTableRef}
               columns={[
                  {
                     field: "rating",
                     title: "Rating",
                     width: 160,
                     render: (rowData) =>
                        renderRatingStars({
                           isSentimentRating: currentRating?.isSentimentRating,
                           ...rowData,
                        }),
                     filterComponent: StarRatingInputValue,
                     customFilterAndSearch: (term, rowData) =>
                        Number(term) >= Number(rowData.rating),
                     filtering: !currentRating?.isSentimentRating,
                  },
                  {
                     field: "date",
                     title: "Voted",
                     width: 200,
                     render: (rowData) => prettyDate(rowData.timestamp),
                     type: "date",
                  },
                  {
                     field: "message",
                     title: "Message",
                     width: 250,
                  },
               ]}
               data={data}
               options={customOptions}
               isLoading={fetchingStreams}
               actions={[
                  exportSelectionAction(
                     columns,
                     "Feedback",
                     setCsvDownloadData
                  ),
               ]}
               title={currentRating?.question}
            />
         </Card>
         <CSVDialogDownload
            title={csvDownloadData?.title}
            data={csvDownloadData?.data}
            filename={`${csvDownloadData?.filename}.csv`}
            defaultOpen={!!csvDownloadData}
            onClose={handleCloseCsvDialog}
         />
      </>
   )
}

export default RatingSideTable
