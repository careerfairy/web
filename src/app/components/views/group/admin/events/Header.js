import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Card, CardHeader, Collapse, Typography } from "@material-ui/core";
import EventsActionButton from "./EventsActionButton";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";

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

const Header = ({ group, handleOpenNewStreamModal, isDraft, scrollRef }) => {
   const classes = useStyles();
   const isScrolling = useScrollTrigger({ target: scrollRef.current });

   return (
      <>
         <Collapse in={!isScrolling}>
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
               />
            </Card>
         </Collapse>
         <EventsActionButton
            group={group}
            isAdmin={true}
            handleOpenNewStreamModal={handleOpenNewStreamModal}
         />
      </>
   );
};

export default Header;
