import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { FixedSizeList } from "react-window";
import { useSelector } from "react-redux";
import {
   Checkbox,
   ListItemAvatar,
   ListItemSecondaryAction, Typography
} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";

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
}));

const StreamList = ({ hiddenStreamIds, toggleStreamHidden }) => {
   const classes = useStyles();
   const streams = useSelector(
      (state) => state.analyticsReducer.streams.fromTimeframe
   );

   function renderRow(props) {
      const { index, style } = props;
      const stream = streams[index];
      const handleToggle = () => {
         console.log("-> key", stream.id);
         toggleStreamHidden(stream.id);
      };

      return (
         <ListItem onClick={handleToggle} style={style} key={stream.id} button>
            <ListItemAvatar>
               <Avatar
                  className={classes.streamCompanyLogo}
                  alt={`${stream.company} Logo`}
                  src={stream.companyLogoUrl}
               />
            </ListItemAvatar>
            <ListItemText id={stream.id} primary={
               <Typography noWrap variant="inherit">
                  {stream.title}
               </Typography>
            } />
            <Checkbox
               edge="end"
               onChange={handleToggle}
               checked={!hiddenStreamIds[stream.id]}
               inputProps={{ "aria-labelledby": stream.id }}
            />
         </ListItem>
      );
   }

   console.log("-> streams in list", streams);
   return (
      <div className={classes.root}>
         <FixedSizeList
            height={400}
            width="100%"
            itemSize={46}
            itemCount={streams.length}
         >
            {renderRow}
         </FixedSizeList>
      </div>
   );
};
export default StreamList;
