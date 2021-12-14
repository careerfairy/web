import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Typography } from "@material-ui/core";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {
      display: "flex",
      alignItems: "center",
   },
   avatar: {
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
const SingleHeroSpeaker = ({ speaker }) => {
   const classes = useStyles();
   return (
      <div className={classes.root}>
         <Avatar
            title={`${speaker.firstName || ""} ${speaker.lastName || ""}`}
            className={classes.avatar}
            src={getResizedUrl(speaker.avatar, "sm")}
         />
         <div className={classes.speakerInfo}>
            <Typography variant="body1">
               {speaker.firstName + " " + speaker.lastName}
            </Typography>
            <Typography variant="body2">
               {`${speaker.position} ${speaker.background}`}
            </Typography>
         </div>
      </div>
   );
};

export default SingleHeroSpeaker;
