import MaterialTable from "@material-table/core"
import ExportCsv from "@material-table/exporters/csv"
import { defaultTableOptions } from "components/util/tableUtils"
import { useEffect, useState } from "react"
import { getListSeparator } from "../../../../util/CommonUtil"

const ExportTable = (props) => {
   const [tableOptions, setTableOptions] = useState(defaultTableOptions)

   useEffect(() => {
      setTableOptions({
         ...defaultTableOptions,
         exportMenu: [
            {
               label: "Export CSV",
               exportFunc: (cols, data) =>
                  ExportCsv(
                     cols,
                     data,
                     props.title || "Table",
                     props.delimiter || getListSeparator()
                  ),
            },
         ],
         ...(props.options && props.options),
      })
   }, [props.title])

   return <MaterialTable options={tableOptions} {...props} />
}

export default ExportTable
