import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Typography } from "@material-ui/core";
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions";
import { speakerPlaceholder } from "../../../../util/constants";

const useStyles = makeStyles((theme) => ({
   root: {
      display: "flex",
      padding: theme.spacing(0.5, 0.5, 0.5, 0),
      flexWrap: "nowrap",
      alignItems: "center",
   },
   speakerAvatar: {
      width: theme.spacing(6),
      height: theme.spacing(6),
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
      textOverflow: "ellipsis",
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 1,
      WebkitLineClamp: 1,
      wordBreak: "break-word",
      overflow: "hidden",
   },
   speakerPosition: {
      textOverflow: "ellipsis",
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 1,
      WebkitLineClamp: 1,
      wordBreak: "break-word",
      overflow: "hidden",
   },
}));

const SpeakerInfo = ({ speaker }) => {
   const classes = useStyles();
   return (
      <div className={classes.root}>
         <Avatar
            src={getResizedUrl(speaker.avatar, "xs") || speakerPlaceholder}
            alt={`${speaker.firstName || ""} - ${
               speaker.lastName || ""
            } - avatar`}
            imgProps={{ loading: "lazy" }}
            className={classes.speakerAvatar}
         />
         <div className={classes.speakerInfoWrapper}>
            <Typography
               variant="h6"
               align="left"
               className={classes.speakerName}
            >
               {speaker.firstName}
            </Typography>
            <Typography
               variant="subtitle1"
               align="left"
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
