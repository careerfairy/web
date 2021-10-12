import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Button,
   Card,
   CardHeader,
   Grid,
   Menu,
   MenuItem,
   Box,
   Typography,
   Tooltip,
} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import {
   StyledTooltipWithButton,
   TooltipHighlight,
} from "../../../../../materialUI/GlobalTooltips";
import FilterStreamsIcon from "@material-ui/icons/Tune";
import { useSelector } from "react-redux";
import EventsActionButton from "./EventsActionButton";

const useStyles = makeStyles((theme) => ({
   root: {
      boxShadow: "none",
      background: "none",
   },
   title: {
      // fontWeight: 400
      marginRight: theme.spacing(1.5),
   },
   header: {
      paddingLeft: theme.spacing(3),
   },
   titleButton: {},
   menuItem: {
      "&:focus": {
         backgroundColor: theme.palette.primary.main,
         "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
            color: theme.palette.common.white,
         },
      },
   },
}));

const Header = ({ group, handleOpenNewStreamModal, isDraft }) => {
   const classes = useStyles();
   return (
      <Card className={classes.root}>
         <CardHeader
            className={classes.header}
            title={
               <Box display="flex" flexWrap="wrap" alignItems="center">
                  <Typography className={classes.title} variant="h4">
                     {isDraft ? "Drafts" : "Events"}
                  </Typography>
               </Box>
            }
            subheader={
               isDraft
                  ? "Manage and approve your drafts"
                  : "Manage your upcoming and past events"
            }
            action={
               <EventsActionButton
                  group={group}
                  isAdmin={true}
                  handleOpenNewStreamModal={handleOpenNewStreamModal}
               />
            }
         />
      </Card>
   );
};

export default Header;
