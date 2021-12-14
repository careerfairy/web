import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar } from "@material-ui/core";
import { AvatarGroup } from "@material-ui/lab";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {},
   avatar: {
      [theme.breakpoints.up("sm")]: {
         width: theme.spacing(8),
         height: theme.spacing(8),
      },
   },
}));
const HeroSpeakers = ({ speakers }) => {
   const classes = useStyles();
   return (
      <AvatarGroup className={classes.root}>
         {speakers.map((speaker) => (
            <Avatar
               className={classes.avatar}
               key={speaker.id}
               src={getResizedUrl(speaker.avatar, "xs")}
               title={`${speaker.firstName || ""} ${speaker.lastName || ""}`}
            />
         ))}
      </AvatarGroup>
   );
};

export default HeroSpeakers;
