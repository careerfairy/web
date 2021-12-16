import React from "react";
import {
   Avatar,
   Box,
   Collapse,
   Divider,
   IconButton,
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   Typography,
} from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import clsx from "clsx";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   avaGrpBtn: {
      borderRadius: theme.spacing(1),
      padding: theme.spacing(0.5),
   },
   expand: {
      transform: "rotate(0deg)",
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.shortest,
      }),
   },
   expandOpen: {
      transform: "rotate(180deg)",
   },
   root: {
      overflowY: "auto",
      overflowX: "hidden",
      maxHeight: 300,
      maxWidth: 200,
      position: "relative",
   },
}));

const Speakers = ({ speakers, clicked }) => {
   const classes = useStyles();
   return (
      <Box className={classes.root}>
         {!!speakers.length && (
            <>
               <Box display="flex" justifyContent="space-between">
                  <AvatarGroup max={3}>
                     {speakers.map((speaker) => (
                        <Avatar
                           key={speaker.id}
                           alt={speaker.firstName}
                           src={getResizedUrl(speaker.avatar, "xs")}
                        />
                     ))}
                  </AvatarGroup>
                  <IconButton
                     className={clsx(classes.expand, {
                        [classes.expandOpen]: clicked,
                     })}
                     aria-expanded={clicked}
                     aria-label="show more"
                  >
                     <ExpandMoreIcon />
                  </IconButton>
               </Box>
               {clicked && <Divider />}
               <Collapse in={clicked}>
                  <Box dense component={List}>
                     {speakers.map((speaker) => (
                        <ListItem key={speaker.id} alignItems="flex-start">
                           <ListItemAvatar>
                              <Avatar
                                 alt={`${speaker.firstName} ${speaker.lastName}`}
                                 src={getResizedUrl(speaker.avatar, "xs")}
                              >
                                 {speaker.firstName
                                    ? `${
                                         speaker.firstName[0] +
                                         speaker.lastName[0]
                                      }`
                                    : ""}
                              </Avatar>
                           </ListItemAvatar>
                           <ListItemText
                              disableTypography
                              primary={
                                 <Typography variant="body1">
                                    {speaker.firstName} {speaker.lastName}
                                 </Typography>
                              }
                              secondary={
                                 <Typography
                                    color="textSecondary"
                                    variant="body2"
                                 >
                                    {speaker.position}
                                 </Typography>
                              }
                           />
                        </ListItem>
                     ))}
                  </Box>
               </Collapse>
            </>
         )}
      </Box>
   );
};

export default Speakers;
