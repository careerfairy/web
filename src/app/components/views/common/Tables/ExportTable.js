import MaterialTable from "@material-table/core";
// import {
//    ExportCsv,
//    // ,ExportPdf
// } from "@material-table/exporters";
import ExportCsv from "@material-table/exporters/csv";
import { defaultTableOptions } from "components/util/tableUtils";
import { useEffect, useState } from "react";

const ExportTable = (props) => {
   const [tableOptions, setTableOptions] = useState(defaultTableOptions);

   useEffect(() => {
      setTableOptions({
         ...defaultTableOptions,
         exportMenu: [
            // {
            //    label: "Export PDF",
            //    exportFunc(cols, data) {
            //       return ExportPdf(cols, data, props.title || "Table");
            //    },
            // },
            {
               label: "Export CSV",
               exportFunc: (cols, data) =>
                  ExportCsv(
                     cols,
                     data,
                     props.title || "Table",
                     props.delimiter || ";"
                  ),
            },
         ],
         ...(props.options && props.options),
      });
   }, [props.title]);

   return <MaterialTable options={tableOptions} {...props} />;
};

export default ExportTable;
