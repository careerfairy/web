import { Avatar, Box, Typography } from "@material-ui/core";
import React from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  speakerInfoRoot: {
    display: "flex",
    flexWrap: "nowrap",
  },
  speakerAvatar: {
    height: 50,
    width: 50
  },
  speakerDetailsWrapper:{
    paddingLeft: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center"
  },
  label:{
    color: theme.palette.common.white,
    fontWeight: 500,
     wordBreak: "break-word",
  },
  subLabel:{
    color: alpha(theme.palette.common.white, 0.7),
    fontWeight: 400,
   wordBreak: "break-word",
  }
}));

const SpeakerInfoCard = ({ imgPath, label, subLabel }) => {
  const classes = useStyles();

  return (
    <Box flexGrow={1} display="flex" className={classes.speakerInfoRoot}>
      <Avatar className={classes.speakerAvatar} src={imgPath} alt={label} />
      <Box className={classes.speakerDetailsWrapper} flexGrow={1}>
        <Typography className={classes.label}>
          {label}
        </Typography>
        <Typography className={classes.subLabel}>
          {subLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default SpeakerInfoCard
