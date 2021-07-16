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
import { prettyDate } from "../../../../../helperFunctions/HelperFunctions";
import { createSelector } from "reselect";

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
      height: 70,
      width: "80%",
      "& img": {
         objectFit: "contain",
      },
      boxShadow: theme.shadows[1],
      padding: theme.spacing(1),
      background: theme.palette.common.white,
   },
}));



const StreamList = ({
   hiddenStreamIds,
   timeFrameName,
   selectVisibleStreams,
   setNewVisibleStreamSelection,
  streamsFromStore
}) => {
   const classes = useStyles();


   const [streams, setStreams] = useState(streamsFromStore);
   // console.log("-> streams on mount", streams);

   // console.log("-> streams in list", streams);

   // Good example of a virtualized list
   // function renderRow(props) {
   //    const { index, style } = props;
   //    const stream = streams[index];
   //    const handleToggle = () => {
   //       console.log("-> key", stream.id);
   //       toggleStreamHidden(stream.id);
   //    };
   //
   //    return (
   //       <ListItem onClick={handleToggle} style={style} key={stream.id} button>
   //          <Checkbox
   //             edge="start"
   //             onChange={handleToggle}
   //             checked={!hiddenStreamIds[stream.id]}
   //             inputProps={{ "aria-labelledby": stream.id }}
   //          />
   //          <ListItemAvatar>
   //             <Avatar
   //                className={classes.streamCompanyLogo}
   //                alt={`${stream.company} Logo`}
   //                src={stream.companyLogoUrl}
   //             />
   //          </ListItemAvatar>
   //          <ListItemText
   //             id={stream.id}
   //             primary={
   //                <Typography noWrap variant="inherit">
   //                   {stream.title}
   //                </Typography>
   //             }
   //          />
   //       </ListItem>
   //    );
   // }
   // return (
   //   <div className={classes.root}>
   //      <FixedSizeList
   //        height={400}
   //        width="100%"
   //        itemSize={46}
   //        itemCount={streams.length}
   //      >
   //         {renderRow}
   //      </FixedSizeList>
   //   </div>
   // );

   return (
      <MaterialTable
         icons={tableIcons}
         style={{
            boxShadow: "none",
         }}
         title={`Filter out streams over the past ${timeFrameName}`}
         onSelectionChange={(rowData) => {
            setNewVisibleStreamSelection(rowData);
         }}
         localization={{
            toolbar: {
               nRowsSelected: (rowCount) => `${rowCount} event(s) selected`,
            },
            pagination: {
               labelRowsSelect: "Events",
            },
         }}
         options={defaultTableOptions}
         columns={[
            {
               field: "companyLogoUrl",
               title: "Logo",
               export: false,
               render: (rowData) => (
                  <Avatar
                     className={classes.avatar}
                     variant="rounded"
                     src={rowData.companyLogoUrl}
                  />
               ),
            },
            {
               field: "company",
               title: "Company",
            },
            {
               field: "title",
               title: "Title",
            },
            { field: "noOfRegistered", title: "Registered", type: "numeric" },
            { field: "noOfTalentPool", title: "Talent Pool", type: "numeric" },
            { field: "noOfParticipating", title: "Participants", type: "numeric" },
            {
               field: "date",
               title: "Date",
               type: "date",
               render: (rowData) => prettyDate(rowData.start),
            },
         ]}
         data={streams}
      />
   );
};
export default StreamList;
