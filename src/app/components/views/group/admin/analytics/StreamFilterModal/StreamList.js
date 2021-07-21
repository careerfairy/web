import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { FixedSizeList } from "react-window";
import { useSelector } from "react-redux";
import { Checkbox, ListItemAvatar, Typography } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import MaterialTable from "material-table";
import { tableIcons, defaultTableOptions } from "../common/TableUtils";
import {
   getResizedUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions";
import { createSelector } from "reselect";
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
   { field: "age", headerName: "Age" },
   { field: "noOfParticipating", headerName: "Participating" },
   { field: "noOfRegistered", headerName: "Registered" },
   { field: "noOfTalentPool", headerName: "Talent Pool" },
];

const getSelectedStreamIds = (streams, hiddenStreamIds) => {
   return streams.filter((stream) => !hiddenStreamIds?.[stream.id]).map(stream => stream.id);
};

const StreamList = ({
   hiddenStreamIds,
   timeFrameName,
   selectVisibleStreams,
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
