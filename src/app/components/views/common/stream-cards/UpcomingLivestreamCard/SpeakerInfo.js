import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Typography } from "@material-ui/core";
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   root: {
      display: "flex",
      padding: theme.spacing(1, 1, 1, 0),
      flexWrap: "nowrap",
   },
   speakerAvatar: {
      width: theme.spacing(8),
      height: theme.spacing(8),
      [theme.breakpoints.up("md")]: {
         width: theme.spacing(10),
         height: theme.spacing(10),
      },
      "& img": {},
   },
   speakerInfoWrapper: {
      paddingLeft: theme.spacing(2),
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   speakerName: {
      fontWeight: 600,
      height: 30,
      textOverflow: "ellipsis",
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 1,
      WebkitLineClamp: 1,
      wordBreak: "break-word",
      overflow: "hidden",
   },
   speakerPosition: {
      height: 50,
      textOverflow: "ellipsis",
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 2,
      WebkitLineClamp: 2,
      wordBreak: "break-word",
      overflow: "hidden",
   },
}));

const SpeakerInfo = ({ speaker }) => {
   const classes = useStyles();
   return (
      <div className={classes.root}>
         <Avatar
            src={getResizedUrl(speaker.avatar, "md")}
            alt={`${speaker.firstName || ""} - ${
               speaker.lastName || ""
            } - avatar`}
            className={classes.speakerAvatar}
         />
         <div className={classes.speakerInfoWrapper}>
            <Typography variant="h6" className={classes.speakerName}>
               {speaker.firstName}
            </Typography>
            <Typography
               variant="subtitle1"
               color="textSecondary"
               className={classes.speakerPosition}
            >
               {speaker.position}
            </Typography>
         </div>
      </div>
   );
};

SpeakerInfo.propTypes = {
   speaker: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      avatar: PropTypes.string,
      position: PropTypes.string,
   }),
};

export default SpeakerInfo;
