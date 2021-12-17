import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Typography } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";
import { speakerPlaceholder } from "../../../util/constants";

const useStyles = makeStyles((theme) => ({
   root: {},
   avatar: {
      [theme.breakpoints.up("sm")]: {
         width: theme.spacing(8),
         height: theme.spacing(8),
      },
   },
   speakerRoot: {
      display: "flex",
      alignItems: "center",
   },
   speakerAva: {
      boxShadow: theme.shadows[3],
      [theme.breakpoints.up("sm")]: {
         width: theme.spacing(10),
         height: theme.spacing(10),
      },
   },
   speakerInfo: {
      padding: theme.spacing(0, 2),
   },
}));

const HeroSpeakers = ({ speakers }) => {
   const classes = useStyles();

   return speakers.length === 1 ? (
      <div className={classes.speakerRoot}>
         <Avatar
            title={`${speakers[0].firstName || ""} ${
               speakers[0].lastName || ""
            }`}
            className={classes.speakerAva}
            src={
               speakers[0].avatar
                  ? getResizedUrl(speakers[0].avatar, "sm")
                  : speakerPlaceholder
            }
         />
         <div className={classes.speakerInfo}>
            <Typography variant="body1">
               {speakers[0].firstName + " " + speakers[0].lastName}
            </Typography>
            <Typography variant="body2">
               {`${speakers[0].position} ${speakers[0].background}`}
            </Typography>
         </div>
      </div>
   ) : (
      <AvatarGroup className={classes.root}>
         {speakers.map((speaker) => (
            <Avatar
               className={classes.avatar}
               key={speaker.id}
               src={
                  speaker.avatar
                     ? getResizedUrl(speaker.avatar, "xs")
                     : speakerPlaceholder
               }
               title={`${speaker.firstName || ""} ${speaker.lastName || ""}`}
            />
         ))}
      </AvatarGroup>
   );
};

export default HeroSpeakers;
