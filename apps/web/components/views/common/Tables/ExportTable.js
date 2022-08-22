import MaterialTable from "@material-table/core"
import { defaultTableOptions } from "components/util/tableUtils"
import { useCallback, useEffect, useState } from "react"
import { CSVDialogDownload } from "../../../custom-hook/useMetaDataActions"

const ExportTable = (props) => {
   const [tableOptions, setTableOptions] = useState(defaultTableOptions)
   const [csvDownloadData, setCsvDownloadData] = useState(null)

   const handleCloseCsvDialog = useCallback(() => {
      setCsvDownloadData(null)
   }, [])

   useEffect(() => {
      setTableOptions({
         ...defaultTableOptions,
         exportMenu: [
            {
               label: "Export CSV",
               exportFunc: (cols, data) => {
                  setCsvDownloadData({
                     data: mapColumnNames(data, cols),
                     title: props.title,
                  })
               },
            },
         ],
         ...(props.options && props.options),
      })
   }, [props.title])

   return (
      <>
         <MaterialTable
            isLoading={props.isLoading}
            options={tableOptions}
            {...props}
         />
         <CSVDialogDownload
            title="Export Table Entries"
            data={csvDownloadData?.data}
            filename={`${csvDownloadData?.title}.csv`}
            defaultOpen={!!csvDownloadData}
            onClose={handleCloseCsvDialog}
         />
      </>
   )
}

function mapColumnNames(data, cols) {
   return data.map((entry) => {
      const entryMapped = {}

      const keys = Object.keys(entry)
      for (let key of keys) {
         const columnEntry = cols.find((col) => col.field === key)

         if (columnEntry) {
            entryMapped[columnEntry.title] = entry[key]
         } else {
            entryMapped[key] = entry[key]
         }
      }

      return entryMapped
   })
}

export default ExportTable
