import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   root: {
      background: theme.palette.secondary.light,
      padding: theme.spacing(1),
      color: theme.palette.common.white,
      borderRadius: theme.spacing(1),
      marginBottom: theme.spacing(1),
   },
   text: {
      fontWeight: 500,
   },
}));

const HighlightText = ({ text }) => {
   const classes = useStyles();
   return (
      <div className={classes.root}>
         <Typography className={classes.text} variant="body1">
            {text}
         </Typography>
      </div>
   );
};

HighlightText.propTypes = {
   text: PropTypes.string.isRequired,
};

export default HighlightText;
