import React, { useCallback, useState } from "react";
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
}));

const Speakers = ({ speakers }) => {
   const [speakersExpanded, setSpeakersExpanded] = useState(false);
   const classes = useStyles();

   const handleToggleExpand = useCallback(
      () => setSpeakersExpanded((prevState) => !prevState),
      []
   );
   return (
      <Box maxWidth={200} position="relative">
         {!!speakers.length && (
            <>
               <Box display="flex" justifyContent="space-between">
                  <AvatarGroup onClick={handleToggleExpand} max={3}>
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
                        [classes.expandOpen]: speakersExpanded,
                     })}
                     onClick={handleToggleExpand}
                     aria-expanded={speakersExpanded}
                     aria-label="show more"
                  >
                     <ExpandMoreIcon />
                  </IconButton>
               </Box>
               {speakersExpanded && <Divider />}
               <Collapse in={speakersExpanded}>
                  <Box dense component={List}>
                     {speakers.map((speaker) => (
                        <ListItem
                           className={classes.root}
                           key={speaker.id}
                           alignItems="flex-start"
                        >
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
                                 <Typography
                                    variant="body1"
                                    className={classes.secondary}
                                 >
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
