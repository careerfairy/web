import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { prettyDate } from "../../../../../helperFunctions/HelperFunctions";
import { DataGrid } from "@material-ui/data-grid";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      height: 400,
      backgroundColor: theme.palette.background.paper,
   },
   streamCompanyLogo: {
      // height: 70,
      // width: "80%",
      "& img": {
         objectFit: "contain",
      },
      // padding: theme.spacing(1),
      // background: theme.palette.common.white
   },
   avatar: {
      // height: 70,
      // width: "80%",
      "& img": {
         objectFit: "contain",
      },
      background: theme.palette.common.white,
   },
}));

const columns = [
   {
      field: "title",
      headerName: "Title",
      description: "Title of the event",
      flex: 1,
   },
   {
      field: "date",
      headerName: "Date",
      flex: 0.2,
      renderCell: (params) => {
         return prettyDate(params.row.start)
      },
      type: "date",
   },
];

const getSelectedStreamIds = (streams, hiddenStreamIds) => {
   return streams.filter((stream) => !hiddenStreamIds?.[stream.id]).map(stream => stream.id);
};

const StreamList = ({
   hiddenStreamIds,
   setNewVisibleStreamSelection,
   streamsFromStore,
}) => {
   const classes = useStyles();

   const [selectionModel, setSelectionModel] = useState([]);

   useEffect(() => {
      const selectedStreamIds = getSelectedStreamIds(
         streamsFromStore,
         hiddenStreamIds
      );
      console.log("-> streamsFromStore", streamsFromStore);
      setSelectionModel(selectedStreamIds)
      setNewVisibleStreamSelection(selectedStreamIds)
   }, []);

   return (
      <div className={classes.root}>
         <DataGrid
            checkboxSelection
            onSelectionModelChange={(selectionObj) => {
               // console.log("-> newSelectionModel", newSelectionModel);
               setNewVisibleStreamSelection(selectionObj.selectionModel);
            }}
            selectionModel={selectionModel}
            columns={columns}
            rows={streamsFromStore}
         />
      </div>
   );
};
export default StreamList;
